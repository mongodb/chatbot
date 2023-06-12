import { Router, Request } from 'express';
import { embeddings } from '../services/embeddings';
import { database } from '../services/database';
import { llm } from '../services/llm';
import { dataStreamer } from '../services/dataStreamer';

const respondRouter = Router();

interface RequestWithStreamParam extends Request {
  params: {
    stream: string;
  };
  body: {
    conversation: Message[];
    id: string;
    ip_address: string;
  };
}

respondRouter.post('/', async (req: RequestWithStreamParam, res, next) => {
  try {
    // TODO: implement type checking on the request

    const stream = Boolean(req.params.stream);
    const { conversation, id } = req.body;
    const latestMessage = conversation[conversation.length - 1];
    const embedding = await embeddings.createEmbedding(latestMessage.content);
    const chunks = await database.content.findVectorMatches({ embedding });

    const conversationInDb = await database.conversations.findById({ id });
    if (!conversationInDb) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    if (conversationInDb.ip_address !== req.body.ip_address) {
      return res.status(403).json({ error: 'IP address does not match' });
    }
    const queryConversation: Conversation = {
      messages: [...conversationInDb.messages, latestMessage],
      user_ip: conversationInDb.ip_address,
      time_created: conversationInDb.time_created,
    };
    let answer;
    if (stream) {
      answer = await dataStreamer.answer({
        res,
        answer: llm.answerQuestionStream({ conversation: queryConversation, chunks }),
        conversation: queryConversation,
        chunks,
      });
    } else {
      answer = await llm.answerQuestionAwaited({ conversation: queryConversation, chunks });
      const successfulOperation = await database.conversations.addMessage({ conversation: queryConversation, answer });
      if (successfulOperation) {
        return res.status(200).send(answer);
      } else {
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  } catch (err) {
    next(err);
  }
});

export { respondRouter };
