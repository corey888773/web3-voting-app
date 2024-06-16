use mongodb::bson::doc;

use super::{poll::Poll, user::User};

#[derive(Clone)]
pub struct DbContext {
    pub db: mongodb::Database,
    pub users_collection: mongodb::Collection<User>,
    pub polls_collection: mongodb::Collection<Poll>,
}

impl DbContext {
    pub async fn new(url: &str) -> Result<Self, mongodb::error::Error> {
        let client_options = mongodb::options::ClientOptions::parse(url).await?;
        let client = mongodb::Client::with_options(client_options)?;

        let db = client.database("web3-voting");
        let users_collection = db.collection::<User>("users");
        let polls_collection = db.collection::<Poll>("polls");

        create_user_indexes(&users_collection).await?;

        Ok(DbContext {
            db,
            users_collection,
            polls_collection,
        })
    }
}
    
async fn create_user_indexes(coll: &mongodb::Collection<User>) -> Result<(), mongodb::error::Error> {
    let pub_address_index = mongodb::IndexModel::builder()
        .keys(doc! { "publicAddress": 1 })
        .options(mongodb::options::IndexOptions::builder().unique(true).build())
        .build();

    let email_index = mongodb::IndexModel::builder()
        .keys(doc! { "mail": 1 })
        .options(mongodb::options::IndexOptions::builder().unique(true).build())
        .build();

    let votes_poll_id_index = mongodb::IndexModel::builder()
        .keys(doc! { "votes.pollId": 1 })
        .build();

    coll.create_index(pub_address_index, None).await?;
    coll.create_index(email_index, None).await?;
    coll.create_index(votes_poll_id_index, None).await?;

    Ok(())
}

async fn create_poll_indexes(coll: &mongodb::Collection<Poll>) -> Result<(), mongodb::error::Error> {
    let contract_address_index = mongodb::IndexModel::builder()
        .keys(doc! { "contractAddress": 1 })
        .options(mongodb::options::IndexOptions::builder().unique(true).build())
        .build();

    coll.create_index(contract_address_index, None).await?;

    Ok(())
}