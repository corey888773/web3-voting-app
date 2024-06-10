use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, errors, Algorithm, DecodingKey, EncodingKey, Header, Validation};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub public_address: String,
    pub exp: i64,
}

pub fn create_jwt(claims: &Claims) -> String {
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(b"s3cr3t".as_ref())).unwrap();
    token
}

pub fn verify_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(&token, &DecodingKey::from_secret(b"s3cr3t".as_ref()), &Validation::new(Algorithm::HS256));
    let claims = token_data.map(|data| data.claims).unwrap();
    
    let now = chrono::Utc::now().timestamp();
    if now > claims.exp {
        return Err(errors::ErrorKind::ExpiredSignature.into());
    } 

    Ok(claims)
}