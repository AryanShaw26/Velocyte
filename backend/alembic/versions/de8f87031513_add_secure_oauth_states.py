"""add secure oauth states

Revision ID: de8f87031513
Revises: 7d45f485f519
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "de8f87031513"
down_revision: Union[str, Sequence[str], None] = "7d45f485f519"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "oauth_states",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("state_hash", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("purpose", sa.String(length=20), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_oauth_states_state_hash",
        "oauth_states",
        ["state_hash"],
        unique=True
    )

    op.create_index(
        "ix_oauth_states_user_id",
        "oauth_states",
        ["user_id"],
        unique=False
    )

    op.create_index(
        "ix_oauth_states_user_purpose",
        "oauth_states",
        ["user_id", "purpose"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        "ix_oauth_states_user_purpose",
        table_name="oauth_states"
    )

    op.drop_index(
        "ix_oauth_states_user_id",
        table_name="oauth_states"
    )

    op.drop_index(
        "ix_oauth_states_state_hash",
        table_name="oauth_states"
    )

    op.drop_table("oauth_states")
