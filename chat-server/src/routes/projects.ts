// TODO: remove this file since it's not used in the project, just taken from the
// snooty-data-api template project.
import express from 'express';
import { findLatestMetadata, findPagesByProject, findUpdatedPagesByProject } from '../services/database';
import { streamData } from '../services/dataStreamer';
import { getRequestId } from '../utils';

const router = express.Router();

// Given a Snooty project name + branch combination, return all build data
// (page ASTs, metadata, assets) for that combination. This should always be the
// latest build data at time of call
router.get('/:snootyProject/:branch/documents', async (req, res, next) => {
  const { snootyProject, branch } = req.params;
  const reqId = getRequestId(req);
  try {
    const metadataDoc = await findLatestMetadata(snootyProject, branch);
    const pagesCursor = await findPagesByProject(snootyProject, branch);
    await streamData(res, pagesCursor, metadataDoc, reqId);
  } catch (err) {
    next(err);
  }
});

router.get('/:snootyProject/:branch/documents/updated/:timestamp', async (req, res, next) => {
  const { snootyProject, branch, timestamp } = req.params;
  const timestampNum = parseInt(timestamp);
  const reqId = getRequestId(req);
  try {
    const metadataDoc = findLatestMetadata(snootyProject, branch);
    const pagesCursor = await findUpdatedPagesByProject(snootyProject, branch, timestampNum);
    await streamData(res, pagesCursor, metadataDoc, reqId);
  } catch (err) {
    next(err);
  }
});

export default router;
