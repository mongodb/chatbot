import { Router, Request } from 'express';
import { database } from '../services/database';

const startRouter = Router();

interface RequestWithStreamParam extends Request {
  body: {
    ip_address: string;
  };
}

startRouter.post('/', async (req: RequestWithStreamParam, res, next) => {
  try {
    // TODO: implement type checking on the request

    const { ip_address } = req.body;

    const conversationInDb = await database.conversations.create({ ip_address });
    if (!conversationInDb) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    if (conversationInDb.ip_address !== req.body.ip_address) {
      return res.status(403).json({ error: 'IP address does not match' });
    }
    res.status(204).json({ id: conversationInDb.id });
  } catch (err) {
    next(err);
  }
});

export { startRouter };
