import { developmentChains } from '../helper-hardhat-config'
import { deployments, ethers, getNamedAccounts, network } from 'hardhat'
import { PollSystem } from '../typechain-types'
import { expect, assert } from 'chai'

function decodeUtf8ToUtf16(utf8Array: any) {
    const textDecoder = new TextDecoder()
    return textDecoder.decode(utf8Array)
}

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('PollSystem', async function () {
          let pollSystem: PollSystem
          const pollDuration = 1000 * 60 * 60 // 1 hour

          this.beforeEach(async function () {
              const deployer = (await getNamedAccounts()).deployer
              const signer = ethers.getSigner(deployer)

              await deployments.fixture('PollSystem')

              const pollSystemDeployment = await deployments.get('PollSystem')
              pollSystem = await ethers.getContractAt('PollSystem', pollSystemDeployment.address)
          })

          describe('createPoll', function () {
              it('Should create a poll', async function () {
                  // Create a poll
                  const question = 'Question 1?'
                  const options = ['Answer 1', 'Answer 2', 'Answer 3']
                  const possibleAnswers = 1 // Single choice

                  const latestBlock = (await ethers.provider.getBlock('latest'))!
                  const tx = await pollSystem.createPoll(question, options, possibleAnswers, pollDuration)
                  await tx.wait()
                  // Check that the poll was created

                  const poll = await pollSystem.getPoll(0)
                  assert.equal(poll[0], question)
                  assert.equal(poll[1].toString(), options.toString())
                  assert.equal(poll[2].toString(), possibleAnswers.toString())
                  assert.equal(poll[3].toString(), (latestBlock.timestamp + pollDuration + 1).toString())
                  assert.equal(poll[4].toString(), '0') // State OPEN
              })
          })

          describe('vote', function () {
              beforeEach(async function () {
                  // Create a poll
                  const question = 'Question 1?'
                  const options = ['Answer 1', 'Answer 2', 'Answer 3']
                  const possibleAnswers = 1 // Single choice

                  await pollSystem.createPoll(question, options, possibleAnswers, pollDuration)
              })

              it('Should vote in a poll', async function () {
                  const options = [0]
                  const expectedVotes = [1, 0, 0]
                  const tx = await pollSystem.vote(0, options)
                  await tx.wait()
                  // Check that the vote was registered

                  const votes = await pollSystem.getPollResults(0)
                  assert.equal(votes.toString(), expectedVotes.toString())
              })

              it('Should not allow to vote twice', async function () {
                  const options = [0]
                  await pollSystem.vote(0, options)
                  await expect(pollSystem.vote(0, options)).to.be.revertedWithCustomError(
                      pollSystem,
                      'PollSystem__AlreadyVoted'
                  )
              })

              it('Should not allow to vote after the poll is ended', async function () {
                  const options = [0]
                  await ethers.provider.send('evm_increaseTime', [pollDuration + 1])
                  await expect(pollSystem.vote(0, options)).to.be.revertedWithCustomError(
                      pollSystem,
                      'PollSystem__PollEnded'
                  )
              })

              it('Should not allow to vote after the poll is locked', async function () {
                  const options = [0]
                  await ethers.provider.send('evm_increaseTime', [pollDuration + 1])
                  await pollSystem.lockPoll(0)
                  await expect(pollSystem.vote(0, options)).to.be.revertedWithCustomError(
                      pollSystem,
                      'PollSystem__PollLocked'
                  )
              })

              it('Should not allow to vote with invalid option', async function () {
                  const options = [3]
                  await expect(pollSystem.vote(0, options)).to.be.revertedWithCustomError(
                      pollSystem,
                      'PollSystem__InvalidOption'
                  )
              })

              it('Should not allow to vote with invalid answers count', async function () {
                  const options = [0, 1]
                  await expect(pollSystem.vote(0, options)).to.be.revertedWithCustomError(
                      pollSystem,
                      'PollSystem__InvalidAnswersCount'
                  )
              })
          })

          describe('lockPoll', function () {
              beforeEach(async function () {
                  // Create a poll
                  const question = 'Question 1?'
                  const options = ['Answer 1', 'Answer 2', 'Answer 3']
                  const possibleAnswers = 1 // Single choice

                  await pollSystem.createPoll(question, options, possibleAnswers, pollDuration)
              })

              it('Should lock a poll', async function () {
                  await ethers.provider.send('evm_increaseTime', [pollDuration + 1])
                  const tx = await pollSystem.lockPoll(0)
                  await tx.wait()
                  // Check that the poll was locked

                  const poll = await pollSystem.getPoll(0)
                  assert.equal(poll[4].toString(), '1') // State LOCKED
              })

              it('Should not allow to lock a poll twice', async function () {
                  await ethers.provider.send('evm_increaseTime', [pollDuration + 1])
                  await pollSystem.lockPoll(0)
                  await expect(pollSystem.lockPoll(0)).to.be.revertedWithCustomError(
                      pollSystem,
                      'PollSystem__AlreadyLocked'
                  )
              })

              it('Should not allow to lock a poll before it ends', async function () {
                  await expect(pollSystem.lockPoll(0)).to.be.revertedWithCustomError(
                      pollSystem,
                      'PollSystem__NotYetEnded'
                  )
              })
          })
      })
