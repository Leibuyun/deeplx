use crate::lang::Language;
use anyhow::Result;
use serde::{Deserialize, Serialize};

const PORT: usize = 1188;

#[derive(Serialize)]
pub struct TranslatePayload {
  text: String,
  source_lang: Language,
  target_lang: Language,
}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct TranslateResp {
  alternatives: Option<Vec<String>>,
  code: Option<u32>,
  data: Option<String>,
  id: Option<u64>,
  method: Option<String>,
  source_lang: Option<String>,
  target_lang: Option<String>,
}

pub async fn translate(text: String, source_lang: Language, target_lang: Language) -> Result<TranslateResp> {
  let payload = TranslatePayload {
    text,
    source_lang,
    target_lang,
  };
  let url = format!("http://127.0.0.1:{}/translate", PORT);
  // let text = reqwest::Client::new()
  //   .post(&url)
  //   .json(&payload)
  //   .send()
  //   .await?
  //   .text()
  //   .await?;
  let client = reqwest::Client::builder().no_proxy().build().unwrap();

  let resp = client
    .post(&url)
    .json(&payload)
    .send()
    .await?
    .json::<TranslateResp>()
    .await?;
  Ok(resp)
}
