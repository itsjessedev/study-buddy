"""Seed script to populate initial skills and question templates from JSON."""

import json
import os
from pathlib import Path

from app.database import SessionLocal, engine, Base
from app.models import Skill, QuestionTemplate, SkillPrerequisite, Badge, User
from app.services.badges import seed_badges
from app.utils.security import hash_password


def load_skills_json():
    """Load skills from content/skills.json."""
    content_dir = Path(__file__).parent.parent / "content"
    skills_file = content_dir / "skills.json"

    if not skills_file.exists():
        raise FileNotFoundError(f"Skills file not found: {skills_file}")

    with open(skills_file, 'r') as f:
        return json.load(f)


def load_explainer(skill_slug, subject):
    """Load explainer content for a skill."""
    content_dir = Path(__file__).parent.parent / "content" / "explainers"

    # Convert subject to directory name (e.g., "Algebra I" -> "algebra-1")
    subject_dir_map = {
        "Pre-Algebra": "pre-algebra",
        "Algebra Basics": "algebra-basics",
        "Algebra I": "algebra-1",
        "Algebra II": "algebra-2",
        "Trigonometry": "trigonometry",
        "Precalculus": "precalculus",
    }

    subject_dir = subject_dir_map.get(subject, subject.lower().replace(" ", "-"))
    explainer_file = content_dir / subject_dir / f"{skill_slug}.md"

    if explainer_file.exists():
        with open(explainer_file, 'r') as f:
            content = f.read()
            # Extract just the "What is..." section as a brief explanation
            lines = content.split('\n')
            explanation_lines = []
            in_what_is = False

            for line in lines:
                if line.startswith('## What is'):
                    in_what_is = True
                    continue
                elif line.startswith('##'):
                    break
                elif in_what_is and line.strip():
                    explanation_lines.append(line.strip())

            explanation = ' '.join(explanation_lines)[:500]  # Limit to 500 chars
            return explanation if explanation else f"Learn about {skill_slug.replace('-', ' ')}"

    return f"Learn about {skill_slug.replace('-', ' ')}"


def create_admin_users(db):
    """Create admin users if they don't exist."""
    created = []

    # Full admin - can make changes
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if existing_admin:
        # Ensure existing admin has full access
        if existing_admin.admin_level != "full":
            existing_admin.is_admin = True
            existing_admin.admin_level = "full"
            db.commit()
            print(f"Updated admin user to full access")
        else:
            print(f"Admin user already exists: admin")
    else:
        admin_user = User(
            username="admin",
            first_name="Admin",
            password_hash=hash_password("admin123"),
            is_admin=True,
            admin_level="full",
        )
        db.add(admin_user)
        created.append("admin")
        print("✅ Created admin user: admin / admin123 (full access)")

    # Guest admin - readonly access for demos
    existing_guest = db.query(User).filter(User.username == "guestAdmin").first()
    if existing_guest:
        # Ensure guest admin has readonly access
        if existing_guest.admin_level != "readonly":
            existing_guest.is_admin = True
            existing_guest.admin_level = "readonly"
            db.commit()
            print(f"Updated guestAdmin to readonly access")
        else:
            print(f"Guest admin already exists: guestAdmin")
    else:
        guest_admin = User(
            username="guestAdmin",
            first_name="Guest",
            password_hash=hash_password("guest123"),
            is_admin=True,
            admin_level="readonly",
        )
        db.add(guest_admin)
        created.append("guestAdmin")
        print("✅ Created guest admin: guestAdmin / guest123 (readonly)")

    if created:
        db.commit()
        print("   ⚠️  Change passwords in production!")

    return created


def seed_database():
    """Seed the database with skills from JSON file."""
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")

    db = SessionLocal()

    try:
        # Create admin users first (always needed)
        create_admin_users(db)

        print("Loading skills from skills.json...")
        data = load_skills_json()

        print(f"Found {len(data['skills'])} current skills to sync")
        print("Creating/updating skills...")

        # Create or update current skills first. Older broad-curriculum skills may
        # still exist in production for historical rows, but app routes only expose
        # slugs from content/skills.json.
        skill_objects = {}
        created_skills = 0
        updated_skills = 0
        for skill_data in data['skills']:
            explanation = load_explainer(skill_data['slug'], skill_data['subject'])

            skill = db.query(Skill).filter(Skill.slug == skill_data['slug']).first()
            if skill:
                updated_skills += 1
                skill.name = skill_data['name']
                skill.subject = skill_data['subject']
                skill.description = skill_data['description']
                skill.khan_url = skill_data['khan_url']
                skill.youtube_id = skill_data.get('youtube_id')
                skill.explanation = explanation
                skill.difficulty_base = skill_data['difficulty_base']
            else:
                created_skills += 1
                skill = Skill(
                    slug=skill_data['slug'],
                    name=skill_data['name'],
                    subject=skill_data['subject'],
                    description=skill_data['description'],
                    khan_url=skill_data['khan_url'],
                    youtube_id=skill_data.get('youtube_id'),
                    explanation=explanation,
                    difficulty_base=skill_data['difficulty_base'],
                )
                db.add(skill)

            skill_objects[skill_data['slug']] = {
                'object': skill,
                'prerequisites': skill_data.get('prerequisites', [])
            }

        db.commit()
        print(f"✅ Synced {len(skill_objects)} skills ({created_skills} created, {updated_skills} updated)!")

        # Refresh all skills to get their IDs
        for slug, data in skill_objects.items():
            db.refresh(data['object'])

        # Create prerequisites
        print("Syncing skill prerequisites...")
        current_skill_ids = [data['object'].id for data in skill_objects.values()]
        if current_skill_ids:
            db.query(SkillPrerequisite).filter(
                SkillPrerequisite.skill_id.in_(current_skill_ids)
            ).delete(synchronize_session=False)

        prereq_count = 0
        for slug, data in skill_objects.items():
            skill = data['object']
            for prereq_slug in data['prerequisites']:
                if prereq_slug in skill_objects:
                    prereq = SkillPrerequisite(
                        skill_id=skill.id,
                        prerequisite_id=skill_objects[prereq_slug]['object'].id,
                    )
                    db.add(prereq)
                    prereq_count += 1
                else:
                    print(f"⚠️  Warning: Prerequisite '{prereq_slug}' not found for skill '{slug}'")

        db.commit()
        print(f"✅ Synced {prereq_count} prerequisites!")

        # Create question templates for skills with generators
        print("Creating question templates...")
        templates = []

        # Map skill slugs to generator types and difficulty ranges
        skill_generator_map = {
            'fractions': ('course_fractions', [1, 2, 3]),
            'solving-equations': ('course_solving_equations', [1, 2, 3]),
            'exponent-rules': ('exponent_rules', [1, 2, 3]),
            'factoring': ('course_factoring', [1, 2, 3]),
            'function-notation': ('function_notation', [1, 2, 3]),
            'graphs-and-slope': ('course_graphs_and_slope', [1, 2, 3]),
            'radicals': ('radical_expressions', [1, 2, 3]),
            'logs-exponentials': ('logs_exponentials', [1, 2, 3]),
            'basic-trig': ('sine_cosine_tangent', [1, 2, 3]),
        }

        # Create or update templates for each current skill. Update every matching
        # skill/difficulty row so stale production templates cannot be selected.
        templates_created = 0
        templates_updated = 0
        for skill_slug, (generator_type, difficulties) in skill_generator_map.items():
            if skill_slug in skill_objects:
                skill = skill_objects[skill_slug]['object']
                for difficulty in difficulties:
                    existing_templates = (
                        db.query(QuestionTemplate)
                        .filter(
                            QuestionTemplate.skill_id == skill.id,
                            QuestionTemplate.difficulty == difficulty,
                        )
                        .all()
                    )
                    if existing_templates:
                        for template in existing_templates:
                            template.template_type = generator_type
                            template.template_data = {"difficulty": difficulty}
                            templates_updated += 1
                    else:
                        templates.append(QuestionTemplate(
                            skill_id=skill.id,
                            template_type=generator_type,
                            template_data={"difficulty": difficulty},
                            difficulty=difficulty,
                        ))
                        templates_created += 1

        for template in templates:
            db.add(template)

        db.commit()
        print(f"✅ Synced question templates ({templates_created} created, {templates_updated} updated)!")

        # Seed badges
        print("Creating badges...")
        badge_count = seed_badges(db)
        print(f"✅ Created {badge_count} badges!")

        print("\n🎉 Database seeded successfully!")
        print(f"   - {db.query(Skill).count()} skills")
        print(f"   - {db.query(SkillPrerequisite).count()} prerequisites")
        print(f"   - {db.query(QuestionTemplate).count()} question templates")
        print(f"   - {db.query(Badge).count()} badges")

        # Show skills by subject
        print("\n📚 Skills by subject:")
        for subject_name in ["College Math Foundations", "Algebra", "Functions", "Precalculus", "Trigonometry"]:
            count = db.query(Skill).filter(Skill.subject == subject_name).count()
            if count > 0:
                print(f"   - {subject_name}: {count} skills")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


def create_admin_only():
    """Create admin users only, without seeding other data."""
    print("Creating database tables if needed...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        create_admin_users(db)
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--admin-only":
        create_admin_only()
    else:
        seed_database()
