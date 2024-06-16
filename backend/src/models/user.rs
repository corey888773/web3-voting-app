use mongodb::bson::doc;
use serde::{Deserialize, Serialize};

use super::{db::DbContext, vote::Vote};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct User {
    pub mail: String,
    #[serde(rename = "publicAddress")] pub public_address: String,
    pub username: String,
    pub nonce: String,
    pub votes: Option<Vec<Vote>>
}

impl DbContext {
    pub async fn insert_user(&self, user: User) -> Result<(), mongodb::error::Error> {
        self.users_collection.insert_one(user, None).await?;
        Ok(())
    }

    pub async fn find_user_by_public_address(&self, public_address: &str) -> Result<Option<User>, mongodb::error::Error> {
        let filter = mongodb::bson::doc! {
            "publicAddress": public_address,
        };

        println!("->> {:<20} - {:?}", "find_user_by_public_address", filter);

        let user = self.users_collection.find_one(filter, None).await?;

        match user {
            Some(user) => Ok(Some(user)),
            None => Ok(None),
        }
    }
}