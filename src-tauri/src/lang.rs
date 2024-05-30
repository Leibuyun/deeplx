use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Language {
  AUTO,
  ZH,
  CS,
  DA,
  NL,
  EN,
  ET,
  FI,
  FR,
  DE,
  EL,
  HU,
  IT,
  JA,
  LV,
  LT,
  PL,
  PT,
  RO,
  RU,
  SK,
  SL,
  ES,
  SV,
}

impl fmt::Display for Language {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Language::AUTO => write!(f, ""),
      _ => write!(f, "{:?}", self),
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_language_equality() {
    assert_eq!(Language::EN.to_string(), "EN");
    assert_eq!(Language::ZH.to_string(), "ZH");
  }
}
