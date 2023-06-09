import express from 'express';
import { findLatestMetadata, findPagesByProject, findUpdatedPagesByProject } from '../services/database';
import { streamData } from '../services/dataStreamer';
import { getRequestId } from '../utils';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const reqId = getRequestId(req);
  try {
    // STUBBED OUT
    // 1. get question + current conversation from request
    // const { question, conversation } = req.body // TODO: modify based on spec
    // 2. create embedding for question
    // const embedding = await embeddings.create({question})
    // 3. find relevant chunks for embedding
    // const chunks = await db.findMatches({embedding})
    // 4. get response to question from LLM with chunks as source of truth
    // const answer = await llm.answerQuestion({question, conversation, chunks}) - NOTE: not sure if awaited here..need to better understand streaming to client
    // 5. stream response back to client
    // const finalAnswer = dataStreamer.answer({res, reqId, answer, conversation, chunks})
    // 6. update conversation in db
    // await db.updateConversation({conversation, finalAnswer})
  } catch (err) {
    next(err);
  }
});

export { router as respondRouter };
