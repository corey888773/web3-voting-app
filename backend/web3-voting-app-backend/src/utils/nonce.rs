use ethers::utils::hex::encode;
use rand::Rng;

pub fn generate_nonce() -> String {
    let mut rng = rand::thread_rng();
    let bytes: [u8; 32] = rng.gen();
    encode(bytes)
}