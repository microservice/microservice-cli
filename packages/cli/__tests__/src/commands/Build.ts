import * as utils from '~/utils'
import Build from '~/commands/Build'

jest.mock('~/utils/exec')

describe('Build.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('.go()', () => {
    beforeEach(() => {
      ;(utils.exec as jest.Mock).mockImplementation(() => {
        /* No Op */
      })
    })

    test('constructor', () => {
      const obj = new Build('image')
      expect(obj).toBeTruthy()
    })

    // test('Builds the Docker image and logs what is happening', async () => {
    //   await new Build('name').go();

    //   expect(execStub.calledWith('docker build -t name .')).toBeTruthy();
    // });

    // test('throws an error because the image could not be build for some reason', async () => {
    //   (utils.exec as any).restore();
    //   execStub = sinon.stub(utils, 'exec').callsFake(async () => {
    //     throw 'Unable to build Docker image';
    //   });
    //   try {
    //     await new Build('name').go();
    //   } catch (e) {
    //     expect(e).toBe('Unable to build Docker image');
    //   }
    // });
  })
})
