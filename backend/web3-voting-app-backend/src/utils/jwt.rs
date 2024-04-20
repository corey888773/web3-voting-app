
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Payload {
    pub public_address: String,

    pub exp: i64,
}