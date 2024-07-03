use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, errors, Algorithm, DecodingKey, EncodingKey, Header, Validation};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub public_address: String,
    pub exp: i64,
    pub username: String 
}

pub fn create_jwt(claims: &Claims, secret: Option<&str>) -> String {
    let secret = secret.unwrap_or("s3cr3t");
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref())).unwrap();
    token
}

pub fn verify_jwt(token: &str, secret: Option<&str>) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secret = secret.unwrap_or("s3cr3t");
    let token_data = decode::<Claims>(&token, &DecodingKey::from_secret(secret.as_ref()), &Validation::new(Algorithm::HS256));
    let claims = token_data.map(|data| data.claims)?;
    
    let now = chrono::Utc::now().timestamp();
    if now > claims.exp {
        return Err(errors::ErrorKind::ExpiredSignature.into());
    } 

    Ok(claims)
}