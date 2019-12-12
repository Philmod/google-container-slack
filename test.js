const fs = require('fs');
const should = require('should');
const async = require('async');
const sinon = require('sinon');
const Octokit = require('@octokit/rest');
const lib = require('./index.js');

const base64Build = 'eyJpZCI6IjE3NDBjZTJhLTYxZDktNGE1OC1iM2M3LWNmYWQ5OWRiOGQwYSIsInN1YnN0aXR1dGlvbnMiOnsiQlJBTkNIX05BTUUiOiJtYXN0ZXIiLCJDT01NSVRfU0hBIjoiNDg5OTFiNGE3Yjc0MThhMzVkMDBlZGVkMDI4YWUxZmMwNmE0ZmM3NSIsIlJFUE9fTkFNRSI6Im5vZGUtZXhhbXBsZS1mcm9udGVuZCJ9LCJwcm9qZWN0SWQiOiJub2RlLWV4YW1wbGUtZ2tlIiwic3RhdHVzIjoiU1VDQ0VTUyIsInNvdXJjZSI6eyJyZXBvU291cmNlIjp7InByb2plY3RJZCI6Im5vZGUtZXhhbXBsZS1na2UiLCJyZXBvTmFtZSI6Im5vZGUtZXhhbXBsZS1mcm9udGVuZCIsImJyYW5jaE5hbWUiOiJtYXN0ZXIifX0sInN0ZXBzIjpbeyJuYW1lIjoiZ2NyLmlvL2Nsb3VkLWJ1aWxkZXJzL2RvY2tlciIsImFyZ3MiOlsiYnVpbGQiLCItdCIsImdjci5pby9ub2RlLWV4YW1wbGUtZ2tlL2Zyb250ZW5kOjQ4OTkxYjRhN2I3NDE4YTM1ZDAwZWRlZDAyOGFlMWZjMDZhNGZjNzUiLCIuIl19XSwicmVzdWx0cyI6eyJpbWFnZXMiOlt7Im5hbWUiOiJnY3IuaW8vbm9kZS1leGFtcGxlLWdrZS9mcm9udGVuZDo0ODk5MWI0YTdiNzQxOGEzNWQwMGVkZWQwMjhhZTFmYzA2YTRmYzc1IiwiZGlnZXN0Ijoic2hhMjU2OmQ4MjEzMmQ5ZmE3ODU5ZTQwODVhYWU4YWYyZWZmNjJmYTNkNTA4ZGI5YThmZDQxNjllZTdiNjE4ZDNmMzI2ZDcifV0sImJ1aWxkU3RlcEltYWdlcyI6WyJzaGEyNTY6ZmJkYjUwYTJkOWQ5MzkxNmFlMDE5M2FiZmQ0Nzk2ZjRiNTgwMTQzZjYwYTk0MDZlNTQ2OTA2YzliYmU3NjhhMCJdfSwiY3JlYXRlVGltZSI6IjIwMTctMDMtMTlUMDA6MDc6MjAuMzU0MjIzWiIsInN0YXJ0VGltZSI6IjIwMTctMDMtMTlUMDA6MDc6MjEuMTU0NDQyNDYzWiIsImZpbmlzaFRpbWUiOiIyMDE3LTAzLTE5VDAwOjA4OjEyLjIyMDUwMloiLCJ0aW1lb3V0IjoiNjAwLjAwMHMiLCJpbWFnZXMiOlsiZ2NyLmlvL25vZGUtZXhhbXBsZS1na2UvZnJvbnRlbmQ6NDg5OTFiNGE3Yjc0MThhMzVkMDBlZGVkMDI4YWUxZmMwNmE0ZmM3NSJdLCJzb3VyY2VQcm92ZW5hbmNlIjp7InJlc29sdmVkUmVwb1NvdXJjZSI6eyJwcm9qZWN0SWQiOiJub2RlLWV4YW1wbGUtZ2tlIiwicmVwb05hbWUiOiJub2RlLWV4YW1wbGUtZnJvbnRlbmQiLCJjb21taXRTaGEiOiI0ODk5MWI0YTdiNzQxOGEzNWQwMGVkZWQwMjhhZTFmYzA2YTRmYzc1In19LCJidWlsZFRyaWdnZXJJZCI6IjY4NmY5YzM1LTM3YzctNDMyYi1hZThmLWM0NDBlMGNjNDA4OSIsImxvZ1VybCI6Imh0dHBzOi8vY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb20vbG9ncy92aWV3ZXI/cHJvamVjdD1ub2RlLWV4YW1wbGUtZ2tlJnJlc291cmNlLmxhYmVscy5idWlsZF9pZD0xNzQwY2UyYS02MWQ5LTRhNTgtYjNjNy1jZmFkOTlkYjhkMGEifQo=';
const base64BuildDefaultTrigger = 'eyJpZCI6IjE3NDBjZTJhLTYxZDktNGE1OC1iM2M3LWNmYWQ5OWRiOGQwYSIsInByb2plY3RJZCI6Im5vZGUtZXhhbXBsZS1na2UiLCJzdGF0dXMiOiJTVUNDRVNTIiwic291cmNlIjp7InN0b3JhZ2VTb3VyY2UiOnsiYnVja2V0Ijoibm9kZS1leGFtcGxlLWJ1Y2tldCIsIm9iamVjdCI6Im5vZGUtZXhhbXBsZS1vYmplY3QudGFyLmd6In19LCJzdGVwcyI6W3sibmFtZSI6Imdjci5pby9jbG91ZC1idWlsZGVycy9kb2NrZXIiLCJhcmdzIjpbImJ1aWxkIiwiLXQiLCJnY3IuaW8vbm9kZS1leGFtcGxlLWdrZS9mcm9udGVuZDo0ODk5MWI0YTdiNzQxOGEzNWQwMGVkZWQwMjhhZTFmYzA2YTRmYzc1IiwiLiJdfV0sInJlc3VsdHMiOnsiaW1hZ2VzIjpbeyJuYW1lIjoiZ2NyLmlvL25vZGUtZXhhbXBsZS1na2UvZnJvbnRlbmQ6NDg5OTFiNGE3Yjc0MThhMzVkMDBlZGVkMDI4YWUxZmMwNmE0ZmM3NSIsImRpZ2VzdCI6InNoYTI1NjpkODIxMzJkOWZhNzg1OWU0MDg1YWFlOGFmMmVmZjYyZmEzZDUwOGRiOWE4ZmQ0MTY5ZWU3YjYxOGQzZjMyNmQ3In1dLCJidWlsZFN0ZXBJbWFnZXMiOlsic2hhMjU2OmZiZGI1MGEyZDlkOTM5MTZhZTAxOTNhYmZkNDc5NmY0YjU4MDE0M2Y2MGE5NDA2ZTU0NjkwNmM5YmJlNzY4YTAiXX0sImNyZWF0ZVRpbWUiOiIyMDE3LTAzLTE5VDAwOjA3OjIwLjM1NDIyM1oiLCJzdGFydFRpbWUiOiIyMDE3LTAzLTE5VDAwOjA3OjIxLjE1NDQ0MjQ2M1oiLCJmaW5pc2hUaW1lIjoiMjAxNy0wMy0xOVQwMDowODoxMi4yMjA1MDJaIiwidGltZW91dCI6IjYwMC4wMDBzIiwiaW1hZ2VzIjpbImdjci5pby9ub2RlLWV4YW1wbGUtZ2tlL2Zyb250ZW5kOjQ4OTkxYjRhN2I3NDE4YTM1ZDAwZWRlZDAyOGFlMWZjMDZhNGZjNzUiXSwic291cmNlUHJvdmVuYW5jZSI6eyJyZXNvbHZlZFJlcG9Tb3VyY2UiOnsicHJvamVjdElkIjoibm9kZS1leGFtcGxlLWdrZSIsInJlcG9OYW1lIjoibm9kZS1leGFtcGxlLWZyb250ZW5kIiwiY29tbWl0U2hhIjoiNDg5OTFiNGE3Yjc0MThhMzVkMDBlZGVkMDI4YWUxZmMwNmE0ZmM3NSJ9fSwiYnVpbGRUcmlnZ2VySWQiOiJkZWZhdWx0LWdpdGh1Yi1jaGVja3MiLCJsb2dVcmwiOiJodHRwczovL2NvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tL2xvZ3Mvdmlld2VyP3Byb2plY3Q9bm9kZS1leGFtcGxlLWdrZVx1MDAyNnJlc291cmNlLmxhYmVscy5idWlsZF9pZD0xNzQwY2UyYS02MWQ5LTRhNTgtYjNjNy1jZmFkOTlkYjhkMGEiLCJzdWJzdGl0dXRpb25zIjp7IkJSQU5DSF9OQU1FIjoibWFzdGVyIiwiQ09NTUlUX1NIQSI6Im40ODk5MWI0YTdiNzQxOGEzNWQwMGVkZWQwMjhhZTFmYzA2YTRmYzc1IiwiUkVQT19OQU1FIjoibm9kZS1leGFtcGxlLWZyb250ZW5kIiwiUkVWSVNJT05fSUQiOiI0ODk5MWI0YTdiNzQxOGEzNWQwMGVkZWQwMjhhZTFmYzA2YTRmYzc1IiwiU0hPUlRfU0hBIjoiNDg5OTFiNGEiLCJUQUdfTkFNRSI6IiJ9LCJ0YWdzIjpbInRyaWdnZXItZGVmYXVsdC1naXRodWItY2hlY2tzIl19Cg==';
const nbCommonFields = 2;
const MS_PER_MINUTE = 60000;

describe('eventToBuild', () => {
  it('should transform a base64 build to an object', () => {
    const build = lib.eventToBuild(base64Build);
    should.exist(build.projectId);
    build.projectId.should.equal('node-example-gke');
  });
});

describe('createSlackMessage', () => {
  it('should create a slack message', async () => {
    const build = {
      id: 'build-id',
      logUrl: 'https://logurl.com',
      status: 'SUCCESS',
      finishTime: '2017-03-19T00:08:12.220502Z',
      source: {},
      substitutions: {
        REPO_NAME: 'horse',
      },
    };
    const message = await lib.createSlackMessage(build);

    message.text.should.equal(`Build \`${build.id}\` finished`);
    should.exist(message.attachments);
    message.attachments.should.have.length(1);
    const attachment = message.attachments[0];
    attachment.title_link.should.equal(build.logUrl);
    attachment.ts.should.equal(1489882092);
    attachment.fields.should.have.length(nbCommonFields);
    attachment.fields[0].value.should.equal(build.status);
  });

  it('should create a slack message saying the build started, with start timestamp if status WORKING', async () => {
    const build = {
      id: 'build-id',
      logUrl: 'https://logurl.com',
      status: 'WORKING',
      startTime: '2017-03-19T00:08:12.220502Z',
      finishTime: null,
      source: {},
      substitutions: {
        REPO_NAME: 'horse',
      },
    };

    const message = await lib.createSlackMessage(build);

    message.text.should.equal('Build `build-id` started');
    should.exist(message.attachments);
    message.attachments.should.have.length(1);
    const attachment = message.attachments[0];
    attachment.title_link.should.equal(build.logUrl);
    attachment.ts.should.equal(1489882092);
    attachment.fields.should.have.length(nbCommonFields - 1);
    attachment.fields[0].value.should.equal(build.status);
  });

  it('should include the build duration as a field', async () => {
    const now = Date.now();
    const deltaInMinutes = 11;
    const build = {
      id: 'build-id',
      logUrl: 'https://logurl.com',
      status: 'SUCCESS',
      startTime: new Date(now - deltaInMinutes * MS_PER_MINUTE),
      finishTime: now,
      source: {},
      substitutions: {
        REPO_NAME: 'horse',
      },
    };
    const message = await lib.createSlackMessage(build);

    const attachment = message.attachments[0];
    attachment.fields[1].value.should.equal(`${deltaInMinutes} minutes`);
  });

  it('should not include build duration as a field for start notifications', async () => {
    const now = Date.now();
    const deltaInMinutes = 11;
    const build = {
      id: 'build-id',
      logUrl: 'https://logurl.com',
      status: 'WORKING',
      startTime: new Date(now - deltaInMinutes * MS_PER_MINUTE),
      finishTime: null,
      source: {},
      substitutions: {
        REPO_NAME: 'horse',
      },
    };
    const message = await lib.createSlackMessage(build);

    const attachment = message.attachments[0];
    attachment.fields.should.not.containEql({ title: 'Duration', value: `${deltaInMinutes} minutes` });
  });

  it('should create a slack message with images', async () => {
    const build = {
      id: 'build-id',
      logUrl: 'https://logurl.com',
      status: 'SUCCESS',
      finishTime: Date.now(),
      images: ['image-1', 'image-2'],
      source: {},
      substitutions: {
        REPO_NAME: 'horse',
      },
    };
    const message = await lib.createSlackMessage(build);

    const attachment = message.attachments[0];
    attachment.fields.should.have.length(nbCommonFields + 1);
    attachment.fields[nbCommonFields].value.should.equal('image-1\nimage-2');
  });

  it('should include the source info in the message', async () => {
    const build = lib.eventToBuild(base64Build);
    const message = await lib.createSlackMessage(build);
    const attachment = message.attachments[0];
    attachment.fields[2].value.should.equal('node-example-frontend');
    attachment.fields[3].value.should.equal('master');
  });

  it('should include the commit author in the message if a github commit is retrieved for mirrored repo triggered build', async () => {
    const build = lib.eventToBuild(base64Build);
    const octokit = new Octokit({
      auth: 'token sjhfgsa',
    });
    const stub = sinon.stub(octokit.git, 'getCommit')
      .returns({
        data: {
          author: {
            name: 'Sun Tzu',
          },
        },
      });
    const githubCommit = await lib.getGithubCommit(build, octokit);
    const message = await lib.createSlackMessage(build, githubCommit);
    const attachment = message.attachments[0];
    attachment.fields[4].value.should.equal('Sun Tzu');
    stub.reset();
  });

  it('should include the commit author in the message if a github commit is retrieved for github app triggered build', async () => {
    const build = lib.eventToBuild(base64BuildDefaultTrigger);
    const octokit = new Octokit({
      auth: 'token sjhfgsa',
    });
    const stub = sinon.stub(octokit.git, 'getCommit')
      .returns({
        data: {
          author: {
            name: 'Sun Tzu',
          },
        },
      });
    const githubCommit = await lib.getGithubCommit(build, octokit);
    const message = await lib.createSlackMessage(build, githubCommit);
    const attachment = message.attachments[0];
    attachment.fields[4].value.should.equal('Sun Tzu');
    stub.reset();
  });

  it('should include the source info in the message, for default trigger', async () => {
    const build = lib.eventToBuild(base64BuildDefaultTrigger);
    const message = await lib.createSlackMessage(build);
    const attachment = message.attachments[0];
    attachment.fields[2].value.should.equal('node-example-frontend');
    attachment.fields[3].value.should.equal('master');
  });

  it('should use the right color depending on the status', () => {
    const build = lib.eventToBuild(base64BuildDefaultTrigger);

    const testCases = [
      {
        status: 'QUEUED',
        want: '#4285F4',
      },
      {
        status: 'WORKING',
        want: '#4285F4',
      },
      {
        status: 'SUCCESS',
        want: '#34A853',
      },
      {
        status: 'FAILURE',
        want: '#EA4335',
      },
      {
        status: 'INTERNAL_ERROR',
        want: '#EA4335',
      },
      {
        status: 'TIMEOUT',
        want: '#FBBC05',
      },
    ];
    testCases.forEach(async (tc) => {
      build.status = tc.status;
      const message = await lib.createSlackMessage(build);
      message.attachments[0].color.should.equal(tc.want, tc.status);
    });
  });
});

function cleanConfig(callback) {
  const config = {
    SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/XXX',
  };
  fs.writeFile('config.json', JSON.stringify(config), 'utf8', callback);
}

describe('subscribe', () => {
  beforeEach(cleanConfig);
  afterEach(cleanConfig);

  beforeEach(() => {
    this.webhookCalled = false;
    lib.webhook.send = (message) => {
      this.webhookCalled = true;
      this.message = message;
    };
  });

  it('should subscribe to pubsub message and send a slack message', async () => {
    const event = {
      data: base64Build,
    };
    await lib.subscribe(event);
    this.webhookCalled.should.be.true();
  });

  it('should not send a message for non final status (by default)', () => {
    const testCases = [
      {
        status: 'QUEUED',
        want: false,
      },
      {
        status: 'WORKING',
        want: false,
      },
      {
        status: 'SUCCESS',
        want: true,
      },
      {
        status: 'FAILURE',
        want: true,
      },
      {
        status: 'INTERNAL_ERROR',
        want: true,
      },
      {
        status: 'TIMEOUT',
        want: true,
      },
    ];
    async.forEach(testCases, async (tc, doneEach) => {
      this.webhookCalled = false;
      const event = {
        data: Buffer.from(JSON.stringify({
          status: tc.status,
        })).toString('base64'),
      };
      lib.subscribe(event, () => {
        this.webhookCalled.should.equal(tc.want);
        doneEach();
      });
    });
  });

  it('should send a message only for specified status', () => {
    lib.status = ['FAILURE', 'INTERNAL_ERROR'];
    const testCases = [
      {
        status: 'QUEUED',
        want: false,
      },
      {
        status: 'WORKING',
        want: false,
      },
      {
        status: 'SUCCESS',
        want: false,
      },
      {
        status: 'FAILURE',
        want: true,
      },
      {
        status: 'INTERNAL_ERROR',
        want: true,
      },
      {
        status: 'TIMEOUT',
        want: false,
      },
    ];
    async.forEach(testCases, async (tc, doneEach) => {
      this.webhookCalled = false;
      const event = {
        data: Buffer.from(JSON.stringify({
          status: tc.status,
        })).toString('base64'),
      };
      lib.subscribe(event, () => {
        this.webhookCalled.should.equal(tc.want, tc.status);
        doneEach();
      });
    }, () => {
    // clean the status list.
      lib.GC_SLACK_STATUS = null;
    });
  });

  it('should send a message at start of build if WORKING is in status', () => {
    lib.status = ['WORKING', 'SUCCESS', 'FAILURE', 'TIMEOUT', 'INTERNAL_ERROR'];
    const testCases = [
      {
        status: 'QUEUED',
        want: false,
      },
      {
        status: 'WORKING',
        want: true,
      },
      {
        status: 'SUCCESS',
        want: true,
      },
      {
        status: 'FAILURE',
        want: true,
      },
      {
        status: 'INTERNAL_ERROR',
        want: true,
      },
      {
        status: 'TIMEOUT',
        want: true,
      },
    ];
    async.forEach(testCases, async (tc, doneEach) => {
      this.webhookCalled = false;
      const event = {
        data: Buffer.from(JSON.stringify({
          status: tc.status,
        })).toString('base64'),
      };
      lib.subscribe(event, () => {
        this.webhookCalled.should.equal(tc.want, tc.status);
        doneEach();
      });
    }, () => {
    // clean the status list.
      lib.GC_SLACK_STATUS = null;
    });
  });

  it('octokit should be defined if token is set', async () => {
    const event = {
      data: base64Build,
    };
    await lib.subscribe(event, 'kuhasdkasjhd');
    this.webhookCalled.should.be.true();
  });

  it('should send error when something goes wrong', async () => {
    await lib.subscribe('testError');
    this.webhookCalled.should.be.true();
    this.message.should.containEql('Error');
  });
});
