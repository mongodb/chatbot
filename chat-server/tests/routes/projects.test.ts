import { MongoClient } from 'mongodb';
import request from 'supertest';
import { setupApp } from '../../src/app';
import { sampleMetadata } from '../sampleData/metadata';

const timestamp = 1685714694420;

describe('Test projects routes', () => {
  // process.env.ATLAS_URI should be defined by default in globalSetup.ts
  const client = new MongoClient(process.env.ATLAS_URI!);
  let app: Express.Application;

  beforeAll(async () => {
    Date.now = jest.fn(() => timestamp);
    app = await setupApp({ mongoClient: client });
  });

  afterAll(async () => {
    await client.close();
  });

  it('should return all data based on project ID', async () => {
    const res = await request(app).get('/projects/docs/master/documents');
    expect(res.status).toBe(200);
    const data = res.text.split('\n');
    expect(data).toMatchSnapshot();
  });

  it('should return documents updated after given timestamp', async () => {
    const prevBuildTime = sampleMetadata[0].created_at;
    const timestamp = new Date(prevBuildTime).getTime();
    const res = await request(app).get(`/projects/docs/master/documents/updated/${timestamp}`);
    expect(res.status).toBe(200);
    const data = res.text.split('\n');
    expect(data).toMatchSnapshot();
  });
});
