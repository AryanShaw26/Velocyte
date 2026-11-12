"""add oauth authorization codes

Revision ID: 7d45f485f519
Revises:
Create Date: 2026-11-12 22:11:51.733120

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Revision identifiers
revision: str = "7d45f485f519"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create OAuth authorization codes table."""

    op.create_table(
        "oauth_authorization_codes",

        sa.Column(
            "id",
            sa.Uuid(),
            nullable=False
        ),

        sa.Column(
            "code_hash",
            sa.String(length=64),
            nullable=False
        ),

        sa.Column(
            "user_id",
            sa.Uuid(),
            nullable=False
        ),

        sa.Column(
            "purpose",
            sa.String(length=20),
            nullable=False
        ),

        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False
        ),

        sa.Column(
            "consumed_at",
            sa.DateTime(timezone=True),
            nullable=True
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE"
        ),

        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_oauth_authorization_codes_code_hash",
        "oauth_authorization_codes",
        ["code_hash"],
        unique=True
    )

    op.create_index(
        "ix_oauth_authorization_codes_user_id",
        "oauth_authorization_codes",
        ["user_id"],
        unique=False
    )

    op.create_index(
        "ix_oauth_codes_user_purpose",
        "oauth_authorization_codes",
        ["user_id", "purpose"],
        unique=False
    )


def downgrade() -> None:
    """Remove OAuth authorization codes table."""

    op.drop_index(
        "ix_oauth_codes_user_purpose",
        table_name="oauth_authorization_codes"
    )

    op.drop_index(
        "ix_oauth_authorization_codes_user_id",
        table_name="oauth_authorization_codes"
    )

    op.drop_index(
        "ix_oauth_authorization_codes_code_hash",
        table_name="oauth_authorization_codes"
    )

    op.drop_table("oauth_authorization_codes")