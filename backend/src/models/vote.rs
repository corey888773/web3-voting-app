use std::sync::Arc;

use axum::http::StatusCode;
use mongodb::bson::{doc, Bson, Document};
use serde::{Deserialize, Serialize};

use super::{db::DbContext};
use crate::utils::error::Error;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Vote {
    #[serde(rename = "contractAddress")] pub contract_address: String,
    #[serde(rename = "pollId")] pub poll_id: String,
    #[serde(rename = "answers")] pub answers: Vec<i32>,
    #[serde(rename = "transactioHash")] pub transaction_hash: String,
}


impl Into<mongodb::bson::Bson> for Vote {
    fn into(self) -> mongodb::bson::Bson {
        mongodb::bson::to_bson(&self).unwrap()
    }
}

impl DbContext {
    pub async fn insert_vote(&self, public_address: &String, vote: &Vote) -> Result<(), mongodb::error::Error> {
        let filter = doc! {
            "publicAddress": public_address,
        };

        let user :Option<Document> = self.db.collection::<Document>("users").find_one(filter.clone(), None).await?;
        if user.is_none() {
            return Err(mongodb::error::Error::from(mongodb::error::ErrorKind::Custom(Arc::new(Error::NotFound(StatusCode::NOT_FOUND, "User not found".to_string())))));
        }

        let update: Document;
        let user_votes = user.unwrap().get("votes").cloned();
        println!("->> {:<20} - {:?}", "user_votes", user_votes);
        
        match user_votes {
            Some(Bson::Null) | None => {
                println!("->> {:<20} - {:?}", "user_votes", "None");
                update = doc! {
                    "$set": {
                        "votes": vec![vote.clone()],
                    },
                };
            },
            _ => { 
                println!("->> {:<20} - {:?}", "user_votes", "Some");
                update = doc! {
                    "$push": {
                        "votes": vote.clone(),
                    },
                };
            },
        }

        println!("->> {:<20} - {:?}", "update", update);
        self.db.collection::<Document>("users").update_one(filter, update, None).await?;
        Ok(())
    }

    pub async fn find_votes_by_public_address(&self, public_address: &str, contract_address: &str) -> Result<Vec<Vote>, mongodb::error::Error> {
        let filter = doc! {
            "publicAddress": public_address,
            "votes.contractAddress": contract_address,
        };

        let user :Option<Document> = self.db.collection::<Document>("users").find_one(filter.clone(), None).await?;

        match user {
            Some(user) => {
                let votes = user.get("votes");
                if votes.is_none() {
                    return Ok(vec![]);
                }

                let votes = votes.unwrap();
                println!("->> {:<20} - {:?}", "votes", votes);
                let votes = votes.as_array().unwrap();
                let votes: Vec<Vote> = votes.iter().map(|vote| {
                    let vote = vote.as_document().unwrap();
                    let vote = mongodb::bson::from_bson(Bson::Document(vote.clone())).unwrap();
                    vote
                }).collect();
                Ok(votes)
            },
            None => Ok(vec![]),
        }
    }
}