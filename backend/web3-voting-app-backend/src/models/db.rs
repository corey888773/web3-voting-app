use mongodb::bson::doc;

use super::user::User;

#[derive(Clone)]
pub struct DbContext {
    db: mongodb::Database,
    pub users_collection: mongodb::Collection<User>,
}

impl DbContext {
    pub async fn new(url: &str) -> Result<Self, mongodb::error::Error> {
        let mut client_options = mongodb::options::ClientOptions::parse(url).await?;
        let client = mongodb::Client::with_options(client_options)?;

        let db = client.database("web3-voting");
        let users_collection = db.collection::<User>("users");

        create_indexes(&users_collection).await?;

        Ok(DbContext {
            db,
            users_collection,
        })
    }
}

async fn create_indexes(coll: &mongodb::Collection<User>) -> Result<(), mongodb::error::Error> {
    let pub_address_index = mongodb::IndexModel::builder()
        .keys(doc! { "publicAddress": 1 })
        .options(mongodb::options::IndexOptions::builder().unique(true).build())
        .build();

    let email_index = mongodb::IndexModel::builder()
        .keys(doc! { "mail": 1 })
        .options(mongodb::options::IndexOptions::builder().unique(true).build())
        .build();

    coll.create_index(pub_address_index, None).await?;
    coll.create_index(email_index, None).await?;

    Ok(())
}