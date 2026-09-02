from types import SimpleNamespace
from app.security import hash_password,verify_password,create_access_token,decode_token

def test_password_hash_is_salted_and_verifiable():
    first=hash_password("correct horse battery staple");second=hash_password("correct horse battery staple")
    assert first!=second;assert verify_password("correct horse battery staple",first);assert not verify_password("wrong password",first)

def test_access_token_is_signed_and_contains_role():
    token=create_access_token(SimpleNamespace(id="USR-1",role="FARMER",profile_id="FARM-1"));payload=decode_token(token)
    assert payload["sub"]=="USR-1";assert payload["role"]=="FARMER";assert payload["profile_id"]=="FARM-1"
