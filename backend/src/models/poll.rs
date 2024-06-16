use std::sync::Arc;

use axum::http::StatusCode;
use ethers::{core::k256::pkcs8::Document, providers::StreamExt};
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};

use crate::utils::error::Error;

use super::{db::DbContext, vote::Vote};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Poll {
    #[serde(rename = "contractAddress")] pub contract_address: String,
    #[serde(rename = "creatorAddress")] pub creator_address: String,
    #[serde(rename = "pollId")] pub poll_id: String,
    #[serde(rename = "question")] pub question: String,
    #[serde(rename = "options")] pub options: Vec<String>,
    #[serde(rename = "votesCount")] pub votes_count: Vec<i32>,
    #[serde(rename = "possibleAnswers")] pub possible_answers: i32,
    #[serde(rename = "endDateTime")] pub end_date_time: i64,
    #[serde(rename = "transactionHash")] pub transaction_hash: String,
}

impl Into<mongodb::bson::Bson> for Poll {
    fn into(self) -> mongodb::bson::Bson {
        mongodb::bson::to_bson(&self).unwrap()
    }
}

impl DbContext {
    pub async fn insert_poll(&self, poll: Poll) -> Result<(), mongodb::error::Error> {
        self.polls_collection.insert_one(poll, None).await?;
        Ok(())
    }

    pub async fn find_poll_by_id(&self, poll_id: &String) -> Result<Option<Poll>, mongodb::error::Error> {
        let filter = doc! {
            "pollId": poll_id,
        };

        let poll = self.polls_collection.find_one(filter, None).await?;

        match poll {
            Some(poll) => Ok(Some(poll)),
            None => Ok(None),
        }
    }

    pub async fn update_poll_votes(&self, poll_id: &String, answers: &Vec<i32>) -> Result<(), mongodb::error::Error> {
        let filter = doc! {
            "pollId": poll_id,
        };

        let poll = self.find_poll_by_id(poll_id).await?;
        if poll.is_none() {
            println!("->> {:<20} - Id: {:?} {:?}", "poll", poll_id, "not found");
            return Err(mongodb::error::Error::from(mongodb::error::ErrorKind::Custom(Arc::new(Error::NotFound(StatusCode::NOT_FOUND, "Poll not found".to_string())))));
        }

        let mut votes = poll.unwrap().votes_count;
        // answers are indexes of the options
        for answer in answers {
            votes[*answer as usize] += 1;
        }

        let update = doc! {
            "$set": {
                "votesCount": votes,
            },
        };

        self.polls_collection.update_one(filter, update, None).await?;
        Ok(())
    }

   pub async fn find_polls_by_creator_address(&self, creator_address: &String, contract_address: &String) -> Result<Vec<Poll>, mongodb::error::Error> {
        let filter = doc! {
            "creatorAddress": creator_address,
            "contractAddress": contract_address,
        };

        let mut polls = self.polls_collection.find(filter, None).await?;

        let mut result = vec![];
        while let Some(poll) = polls.next().await {
            match poll {
                Ok(poll) => result.push(poll),
                Err(e) => return Err(e.into()),
            }
        }
    
        Ok(result)
    }
}