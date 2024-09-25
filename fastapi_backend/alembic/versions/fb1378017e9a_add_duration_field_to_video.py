"""Add duration field to Video

Revision ID: fb1378017e9a
Revises: 82cd68860059
Create Date: 2024-09-24 10:03:27.081803

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fb1378017e9a'
down_revision: Union[str, None] = '82cd68860059'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create a new table with the updated schema
    op.create_table(
        'videos_new',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('duration', sa.Integer, nullable=True),  # Nullable duration
        sa.Column('video_type', sa.String(), nullable=True),
        sa.Column('season', sa.Integer(), nullable=True),
        sa.Column('episode', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('video_file_url', sa.String(), nullable=True),
        # Add any other columns from the original 'videos' table
    )

    # Copy data from old 'videos' table to the new one
    op.execute('''
        INSERT INTO videos_new (id, duration, video_type, season, episode, title, video_file_url)
        SELECT id, duration, video_type, season, episode, title, video_file_url FROM videos;
    ''')

    # Drop the old 'videos' table
    op.drop_table('videos')

    # Rename the new table to 'videos'
    op.rename_table('videos_new', 'videos')

    # Recreate index on 'title' column if necessary
    op.create_index(op.f('ix_videos_title'), 'videos', ['title'], unique=False)


def downgrade() -> None:
    # Recreate the original 'videos' table with the previous schema
    op.create_table(
        'videos_old',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('duration', sa.Integer, nullable=False),  # Original non-nullable duration
        sa.Column('video_type', sa.String(), nullable=True),
        sa.Column('season', sa.Integer(), nullable=True),
        sa.Column('episode', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('video_file_url', sa.String(), nullable=False),
        # Add other columns if they existed
    )

    # Copy data back to the old table
    op.execute('''
        INSERT INTO videos_old (id, duration, video_type, season, episode, title, video_file_url)
        SELECT id, duration, video_type, season, episode, title, video_file_url FROM videos;
    ''')

    # Drop the modified table
    op.drop_table('videos')

    # Rename the old table back to 'videos'
    op.rename_table('videos_old', 'videos')

    # Drop the index if it existed
    op.drop_index(op.f('ix_videos_title'), table_name='videos')
