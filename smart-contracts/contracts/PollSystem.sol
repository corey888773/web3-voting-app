// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

// Errors
error PollSystem__PollLocked();
error PollSystem__PollEnded();
error PollSystem__AlreadyVoted();
error PollSystem__InvalidAnswersCount();
error PollSystem__InvalidOption();
error PollSystem__AlreadyLocked();
error PollSystem__YouAreNotTheCreator();

contract PollSystem {
    // Types
    enum State {
        OPEN,
        LOCKED
    }

    struct Poll {
        bytes32 id;
        string question;
        string[] options;
        uint64 possibleAnswers;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) votes;
        uint256 endTime;
        State state;
        address creator;
    }

    // State Variables
    bytes32[] public s_pollIds;
    mapping(bytes32 => Poll) public s_polls;

    // Functions
    function createPoll(
        bytes32 id,
        string memory question,
        string[] memory options,
        uint64 possibleAnswers,
        uint256 duration
    ) public {
        Poll storage newPoll = s_polls[id];
        s_pollIds.push(id);

        newPoll.id = id;
        newPoll.question = question;
        newPoll.options = options;
        newPoll.possibleAnswers = possibleAnswers;
        newPoll.endTime = block.timestamp + duration;
        newPoll.state = State.OPEN;
        newPoll.creator = msg.sender;
    }

    function vote(bytes32 pollId, uint256[] memory chosenOptions) public {
        Poll storage poll = s_polls[pollId];

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

    function lockPoll(bytes32 pollId) public {
        Poll storage poll = s_polls[pollId];
        if (msg.sender != poll.creator) revert PollSystem__YouAreNotTheCreator();
        if (poll.state == State.LOCKED) revert PollSystem__AlreadyLocked();
        poll.state = State.LOCKED;
    }

    // Views
    function getPollResults(bytes32 pollId) public view returns (uint256[] memory) {
        Poll storage poll = s_polls[pollId];
        uint256[] memory results = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = poll.votes[i];
        }

        return results;
    }

    function getMyPolls(address userAddress) public view returns (bytes32[] memory) {
        uint256 myPollsCount = 0;
        for (uint256 i = 0; i < s_pollIds.length; i++) {
            bytes32 pollId = s_pollIds[i];
            if (s_polls[pollId].creator == userAddress) {
                myPollsCount++;
            }
        }

        bytes32[] memory myPolls = new bytes32[](myPollsCount);
        uint256 index = 0;
        for (uint256 i = 0; i < s_pollIds.length; i++) {
            bytes32 pollId = s_pollIds[i];
            if (s_polls[pollId].creator == userAddress) {
                myPolls[index] = pollId;
                index++;
            }
        }

        return myPolls;
    }

    function getOpenPolls() public view returns (bytes32[] memory) {
        uint256 openPollsCount = 0;
        for (uint256 i = 0; i < s_pollIds.length; i++) {
            bytes32 pollId = s_pollIds[i];
            if (s_polls[pollId].state == State.OPEN) {
                openPollsCount++;
            }
        }

        bytes32[] memory openPolls = new bytes32[](openPollsCount);
        uint256 index = 0;
        for (uint256 i = 0; i < s_pollIds.length; i++) {
            bytes32 pollId = s_pollIds[i];
            if (s_polls[pollId].state == State.OPEN) {
                openPolls[index] = pollId;
                index++;
            }
        }

        return openPolls;
    }

    function hasVoted(bytes32 pollId, address voter) public view returns (bool) {
        return s_polls[pollId].hasVoted[voter];
    }

    function getPollState(bytes32 pollId) public view returns (State) {
        return s_polls[pollId].state;
    }

    function getPoll(
        bytes32 pollId
    ) public view returns (bytes32, string memory, string[] memory, uint64, uint256, State, address) {
        Poll storage poll = s_polls[pollId];
        return (poll.id, poll.question, poll.options, poll.possibleAnswers, poll.endTime, poll.state, poll.creator);
    }
}
