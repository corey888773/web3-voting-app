// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

// Errors
error PollSystem__PollLocked();
error PollSystem__PollEnded();
error PollSystem__AlreadyVoted();
error PollSystem__InvalidAnswersCount();
error PollSystem__InvalidOption();
error PollSystem__NotYetEnded();
error PollSystem__AlreadyLocked();

contract PollSystem {
    // Types
    enum State {
        OPEN,
        LOCKED
    }

    struct Poll {
        string question;
        string[] options;
        uint64 possibleAnswers;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) votes;
        uint256 endTime;
        State state;
    }

    // State Variables
    Poll[] public m_polls;

    // Functions
    function createPoll(
        string memory question,
        string[] memory options,
        uint64 possibleAnswers,
        uint256 duration
    ) public {
        Poll storage newPoll = m_polls.push();
        newPoll.question = question;
        newPoll.options = options;
        newPoll.possibleAnswers = possibleAnswers;
        newPoll.endTime = block.timestamp + duration;
        newPoll.state = State.OPEN;
    }

    function vote(uint256 pollIndex, uint256[] memory chosenOptions) public {
        Poll storage poll = m_polls[pollIndex];

        if (poll.state != State.OPEN) revert PollSystem__PollLocked();
        if (block.timestamp >= poll.endTime) revert PollSystem__PollEnded();
        if (poll.hasVoted[msg.sender]) revert PollSystem__AlreadyVoted();
        if (chosenOptions.length == 0 || chosenOptions.length > poll.possibleAnswers)
            revert PollSystem__InvalidAnswersCount();

        for (uint256 i = 0; i < chosenOptions.length; i++) {
            uint256 option = chosenOptions[i];
            if (option >= poll.options.length) revert PollSystem__InvalidOption();
            poll.votes[option] += 1;
        }
        poll.hasVoted[msg.sender] = true;
    }

    function lockPoll(uint256 pollIndex) public {
        Poll storage poll = m_polls[pollIndex];
        if (poll.state == State.LOCKED) revert PollSystem__AlreadyLocked();
        if (block.timestamp <= poll.endTime) revert PollSystem__NotYetEnded();
        poll.state = State.LOCKED;
    }

    // Views
    function getPollResults(uint256 pollIndex) public view returns (uint256[] memory) {
        Poll storage poll = m_polls[pollIndex];
        uint256[] memory results = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = poll.votes[i];
        }

        return results;
    }

    function getOpenPolls() public view returns (uint256[] memory) {
        uint256 openPollsCount = 0;
        for (uint256 i = 0; i < m_polls.length; i++) {
            if (m_polls[i].state == State.OPEN) {
                openPollsCount++;
            }
        }

        uint256[] memory openPolls = new uint256[](openPollsCount);
        uint256 index = 0;
        for (uint256 i = 0; i < m_polls.length; i++) {
            if (m_polls[i].state == State.OPEN) {
                openPolls[index] = i;
                index++;
            }
        }

        return openPolls;
    }

    function hasVoted(uint256 pollIndex, address voter) public view returns (bool) {
        return m_polls[pollIndex].hasVoted[voter];
    }

    function getPollState(uint256 pollIndex) public view returns (State) {
        return m_polls[pollIndex].state;
    }

    function getPoll(uint256 pollIndex) public view returns (string memory, string[] memory, uint64, uint256, State) {
        Poll storage poll = m_polls[pollIndex];
        return (poll.question, poll.options, poll.possibleAnswers, poll.endTime, poll.state);
    }
}
