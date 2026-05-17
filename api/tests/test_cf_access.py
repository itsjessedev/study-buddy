"""Tests for Cloudflare Access account mapping."""

import os
import unittest

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret"
os.environ["CF_ACCESS_ALLOWED_EMAILS"] = "jeldridge2583@gmail.com, jesse@junipr.io"
os.environ["CF_ACCESS_ACCOUNT_USERNAME"] = "jesse"
os.environ["CF_ACCESS_ACCOUNT_FIRST_NAME"] = "Jesse"

from app.cf_access import allowed_cf_access_emails, get_or_create_cf_access_user
from app.database import Base, SessionLocal, engine
from app.models import User


class CloudflareAccessAccountMappingTest(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            db.query(User).delete()
            db.commit()

    def tearDown(self):
        Base.metadata.drop_all(bind=engine)

    def test_allowed_emails_are_normalized(self):
        self.assertEqual(
            allowed_cf_access_emails(),
            {"jeldridge2583@gmail.com", "jesse@junipr.io"},
        )

    def test_allowed_emails_share_one_local_account(self):
        with SessionLocal() as db:
            first_user = get_or_create_cf_access_user(db, "jeldridge2583@gmail.com")
            second_user = get_or_create_cf_access_user(db, "jesse@junipr.io")

            self.assertEqual(first_user.id, second_user.id)
            self.assertEqual(first_user.username, "jesse")
            self.assertEqual(db.query(User).count(), 1)


if __name__ == "__main__":
    unittest.main()
