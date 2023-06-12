import { Router, Request } from 'express';
import { database } from '../services/database';

const rateRouter = Router();

interface RequestWithStreamParam extends Request {
  body: {
    conversation: Message[];
    id: string;
    ip_address: string;
    message_index: number;
    rating: boolean;
  };
}

rateRouter.post('/', async (req: RequestWithStreamParam, res, next) => {
  try {
    // TODO: implement type checking on the request

    const { conversation, id, message_index, rating } = req.body;

    const conversationInDb = await database.conversations.findById({ id });
    if (!conversationInDb) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    if (conversationInDb.ip_address !== req.body.ip_address) {
      return res.status(403).json({ error: 'IP address does not match' });
    }
    const successfulOperation = await database.conversations.rateMessage({ id, conversation, message_index, rating });
    if (successfulOperation) {
      return res.status(204);
    } else {
      return res.status(404).json({ error: 'Message not found' });
    }
  } catch (err) {
    next(err);
  }
});

export { rateRouter };
