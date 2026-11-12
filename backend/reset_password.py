from getpass import getpass

from app.db.database import SessionLocal
from app.db.models import User
from app.core.security import hash_password


def main():
    email = input("Enter your Velocyte account email: ").strip().lower()
    new_password = getpass("Enter your new password: ")
    confirm_password = getpass("Confirm your new password: ")

    if new_password != confirm_password:
        print("Passwords do not match.")
        return

    if len(new_password) < 8:
        print("Password must contain at least 8 characters.")
        return

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print("User not found.")
            return

        user.password_hash = hash_password(new_password)
        db.commit()

        print("Password successfully reset!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()