"""
Seed script — populates SQLite with content from the PWA asset files.
Run: cd api && python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal, Base
from models import *
import bcrypt

# ============================================
# Image URLs (from app/src/assets/images.ts)
# ============================================
IMAGES = {
    "duit_yourself_banner": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/Duit%20Yourself%20-%20LP%20Cover.jpg",
    "make_cents_cover": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/Make-it-Make-Cents-cover.png",
    "beyond_profile_cover": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/Beyond-The-Profile-Personal-Branding-on-LinkedIn-cover.png",
    "driven": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/Driven%20-%201%20-%20Who%20is%20Nicky%20Lim_.png",
    "race": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/DrMunirah-RACE-C1-Meet%20Your%20Instructor%20Dato%20Dr.%20Munirah!.png",
    "illuminate": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/Illuminate-C1-Meet%20Your%20Instructor.png",
    "real_talk": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/DrMunirah-B2-C1-The%20Essence%20of%20Transformative%20Leadership.png",
    "people_first": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/People-First-Customer-Experience-in-the-Digital-Age-cover.png",
    "web_dev": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "graphic_design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    # For You thumbnails
    "fy_before_i_do": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/Desmond-BeforeIDo-Cover.png",
    "fy_simpan": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/asad%20safuan%20-%20simpan%20atau%20melabur%20-%20cover.png",
    "fy_money_talk": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/moneytalk-yuva-cover.png",
    "fy_pdpa": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/Samantha-PDPAact-cover.png",
    # Bundle chapter thumbnails
    "ch_how_much": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B1-C1-How%20Much%20Do%20I%20Actually%20Make__.png",
    "ch_deductions": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B1-C2-Understanding%20Deductions_.png",
    "ch_gig_challenges": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B2-C1-Challenges%20Gig%20Workers%20Face_.png",
    "ch_inconsistent": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B2-C2-Inconsistent%20Income%20Earners_.png",
    "ch_gig_goals": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B2-C3-Gig%20Working%20Requires%20Goals%20%26%20Motivations_.png",
    "ch_retirement": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B2-C4-Securing%20Your%20Future%20-%20Retirement.png",
    "ch_hutang": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B3-C1-Perangkap%20Hutang.png",
    "ch_hutang_my": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B3-C2-Hutang%20Pengguna%20di%20Malaysia.png",
    "ch_bnpl_buy": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B3-C3-Beli%20Sekarang%20Bayar%20Kemudian.png",
    "ch_bnpl_benefit": "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/BNM-P1-B3-C4-Manfaat%20Menggunakan%20BNPL.png",
    # Creator avatars
    "avatar_celine": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    "avatar_john": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    "avatar_sarah": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    "avatar_michael": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
}

PLACEHOLDER_VIDEO = "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4"
DUIT_VIDEO_1 = "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/LP_DuitYourself_2025-B01C01_HowMuchDoIActuallyMake.mp4"
DUIT_VIDEO_2 = "https://magicpatterns.tos-ap-southeast-1.bytepluses.com/LP_DuitYourself_2025-B01C02_UnderstandingDeductions.mp4"


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- Default user (1000 credits) ---
    pw_hash = bcrypt.hashpw("demo1234".encode(), bcrypt.gensalt()).decode()
    user = User(name="Demo User", email="demo@openacademy.org", password_hash=pw_hash, credits=1000)
    db.add(user)
    db.flush()

    # --- Creators ---
    creators = [
        Creator(id=1, name="Celine Ting", job_title="Managing Director, OpenAcademy", bio="Celine comprises the extensive know-how on building digital brands from leading digital projects across various industries and markets.", avatar=IMAGES["avatar_celine"]),
        Creator(id=2, name="John Smith", job_title="Senior Instructor", bio="John is an experienced educator with over 15 years in digital marketing and content strategy.", avatar=IMAGES["avatar_john"]),
        Creator(id=3, name="Sarah Lee", job_title="Marketing Expert", bio="Sarah specializes in social media marketing and has helped numerous brands grow their online presence.", avatar=IMAGES["avatar_sarah"]),
        Creator(id=4, name="Michael Chen", job_title="SEO Specialist", bio="Michael is a certified SEO expert with a track record of improving search rankings for major brands.", avatar=IMAGES["avatar_michael"]),
    ]
    db.add_all(creators)

    # --- Tags ---
    tags = ["finance", "marketing", "content creation", "personal branding", "entrepreneurship", "creative", "technology", "business", "customer experience", "diversity", "relationships", "legal"]
    tag_objs = [Tag(name=t) for t in tags]
    db.add_all(tag_objs)
    db.flush()

    # --- Lesson Plans ---
    plans = [
        Plan(id=1, title="Duit Yourself", description="Money matters made simple, relatable and real!", image=IMAGES["duit_yourself_banner"], background=IMAGES["duit_yourself_banner"], category="FINANCE", credits_required=2000, rating=48, review_count=0, certificate_on_completion=True),
        Plan(id=2, title="Make it Make Cents", description="Your ultimate guide to building strong foundations in content creation.", image=IMAGES["make_cents_cover"], background=IMAGES["make_cents_cover"], category="CONTENT CREATION", credits_required=1500, rating=48, review_count=124, certificate_on_completion=True),
        Plan(id=3, title="Beyond The Profile", description="Craft a compelling LinkedIn presence and leverage it for career growth.", image=IMAGES["beyond_profile_cover"], background=IMAGES["beyond_profile_cover"], category="PERSONAL BRANDING", credits_required=1800, rating=46, review_count=87, certificate_on_completion=True),
    ]
    db.add_all(plans)

    # Plan learnings + audience
    plan_content = {
        1: {
            "audience": ["Young professionals looking to manage their income", "Young adults looking to better plan their future and retirement", "Anyone seeking to take control of their personal finances"],
            "learnings": ["Practical ways to manage your income and savings", "Handle financial pressure from personal relationships", "Better understanding of financial rights and retirement planning"],
        },
        2: {
            "audience": ["Aspiring content creators", "Existing creators wanting to monetise", "Anyone curious about turning passion into career"],
            "learnings": ["Identify your niche and build a personal brand", "Create engaging content across platforms", "Monetise through brand deals and sponsorships"],
        },
        3: {
            "audience": ["Professionals elevating their LinkedIn presence", "Job seekers standing out to recruiters", "Entrepreneurs attracting clients through thought leadership"],
            "learnings": ["Craft a LinkedIn profile that tells a compelling story", "Content strategies for credible industry voice", "Build and nurture a professional network"],
        },
    }
    for plan_id, content in plan_content.items():
        for text in content["audience"]:
            db.add(PlanLearning(plan_id=plan_id, text=text, type="audience"))
        for text in content["learnings"]:
            db.add(PlanLearning(plan_id=plan_id, text=text, type="learning"))

    # --- Lesson Plan Bundles (plan_id != null) ---
    lesson_bundles = [
        Bundle(id=1, plan_id=1, title="What's In Your Paycheque?", subtitle="Bundle 1", description="Understand your paycheck, deductions, and take-home pay", category="FINANCE", seq_no=1, credits_required=0, duration_minutes=20, is_free=True, thumbnail=IMAGES["duit_yourself_banner"], creator_id=1),
        Bundle(id=2, plan_id=1, title="Personal Finances As A Gig Worker", subtitle="Bundle 2", description="Keep cash flowing and build a future that works for you.", category="FINANCE", seq_no=2, credits_required=50, duration_minutes=20, is_free=False, thumbnail=IMAGES["duit_yourself_banner"], creator_id=1),
        Bundle(id=3, plan_id=1, title="Pengurusan Hutang & BNPL", subtitle="Bundle 3", description="Ketahui cara bijak urus hutang dan elak perangkap kewangan.", category="FINANCE", seq_no=3, credits_required=50, duration_minutes=20, is_free=False, thumbnail=IMAGES["duit_yourself_banner"], creator_id=2),
        Bundle(id=4, plan_id=2, title="Getting Started as a Creator", subtitle="Bundle 1", description="Find your niche, build your brand, create content that stands out.", category="CONTENT CREATION", seq_no=1, credits_required=0, duration_minutes=15, is_free=True, thumbnail=IMAGES["make_cents_cover"], creator_id=3),
        Bundle(id=5, plan_id=2, title="Monetising Your Content", subtitle="Bundle 2", description="Turn your passion into profit with top creator strategies.", category="CONTENT CREATION", seq_no=2, credits_required=50, duration_minutes=15, is_free=False, thumbnail=IMAGES["make_cents_cover"], creator_id=3),
        Bundle(id=6, plan_id=3, title="Build Your Brand Foundation", subtitle="Bundle 1", description="Define your personal brand and optimise your LinkedIn headline.", category="PERSONAL BRANDING", seq_no=1, credits_required=0, duration_minutes=15, is_free=True, thumbnail=IMAGES["beyond_profile_cover"], creator_id=4),
        Bundle(id=7, plan_id=3, title="Content & Thought Leadership", subtitle="Bundle 2", description="Create posts that resonate and position yourself as a thought leader.", category="PERSONAL BRANDING", seq_no=2, credits_required=50, duration_minutes=15, is_free=False, thumbnail=IMAGES["beyond_profile_cover"], creator_id=4),
    ]
    db.add_all(lesson_bundles)

    # --- Standalone Bundles (Originals, plan_id = null) ---
    standalone_bundles = [
        Bundle(id=101, plan_id=None, title="Driven: Lessons From The Fastlane", subtitle="DRIVEN", description="A thoughtful series about resilience and purpose.", category="ENTREPRENEURSHIP", credits_required=10, duration_minutes=90, is_free=False, thumbnail=IMAGES["driven"], creator_id=1),
        Bundle(id=103, plan_id=None, title="R.A.C.E Framework", subtitle="R.A.C.E", description="Exploring race, bias, and building inclusive workplaces.", category="DIVERSITY & INCLUSION", credits_required=5, duration_minutes=75, is_free=False, thumbnail=IMAGES["race"], creator_id=2),
        Bundle(id=104, plan_id=None, title="Illuminate: Projection Mapping", subtitle="ILLUMINATE", description="The art and technology of projection mapping.", category="CREATIVE", credits_required=0, duration_minutes=68, is_free=True, thumbnail=IMAGES["illuminate"], creator_id=3),
        Bundle(id=105, plan_id=None, title="Web Development Fundamentals", subtitle="WEB DEV", description="Build modern websites and web applications.", category="TECHNOLOGY", credits_required=10, duration_minutes=120, is_free=False, thumbnail=IMAGES["web_dev"], creator_id=4),
        Bundle(id=106, plan_id=None, title="Graphic Design Essentials", subtitle="DESIGN", description="Master visual design and branding fundamentals.", category="CREATIVE", credits_required=0, duration_minutes=55, is_free=True, thumbnail=IMAGES["graphic_design"], creator_id=3),
        Bundle(id=107, plan_id=None, title="Real Talk Real Business", subtitle="REAL TALK", description="Leadership, ethics, and positive workplace culture.", category="BUSINESS", credits_required=10, duration_minutes=50, is_free=False, thumbnail=IMAGES["real_talk"], creator_id=2),
        Bundle(id=108, plan_id=None, title="People-First: Customer Experience", subtitle="PEOPLE FIRST", description="Meaningful customer journeys in the digital age.", category="CUSTOMER EXPERIENCE", credits_required=5, duration_minutes=55, is_free=False, thumbnail=IMAGES["people_first"], creator_id=1),
    ]
    db.add_all(standalone_bundles)
    db.flush()

    # --- Series (one per bundle for simplicity) ---
    for b in lesson_bundles + standalone_bundles:
        db.add(Series(id=b.id, bundle_id=b.id, title=b.title, description=b.description, image=b.thumbnail, creator_id=b.creator_id))
    db.flush()

    # --- Chapters for lesson plan bundles ---
    chapter_data = [
        # Bundle 1
        (1, 1, "How Much Do I Actually Make", "5 mins", IMAGES["ch_how_much"], DUIT_VIDEO_1, True),
        (2, 1, "Understanding Deductions", "5 mins", IMAGES["ch_deductions"], DUIT_VIDEO_2, False),
        # Bundle 2
        (5, 2, "Challengers Gig Workers Face", "5 mins", IMAGES["ch_gig_challenges"], PLACEHOLDER_VIDEO, True),
        (6, 2, "Inconsistent Income Earners", "5 mins", IMAGES["ch_inconsistent"], PLACEHOLDER_VIDEO, False),
        (7, 2, "Gig Working Requires Goals", "5 mins", IMAGES["ch_gig_goals"], PLACEHOLDER_VIDEO, False),
        (8, 2, "Securing Your Future", "5 mins", IMAGES["ch_retirement"], PLACEHOLDER_VIDEO, True),
        # Bundle 3
        (9, 3, "Parangkap Hutang", "5 mins", IMAGES["ch_hutang"], PLACEHOLDER_VIDEO, False),
        (10, 3, "Hutang Pengguna di Malaysia", "5 mins", IMAGES["ch_hutang_my"], PLACEHOLDER_VIDEO, True),
        (11, 3, "Beli Sekarang Bayar Kemudian", "5 mins", IMAGES["ch_bnpl_buy"], PLACEHOLDER_VIDEO, False),
        (12, 3, "Manfaat menggunakan BNPL", "5 mins", IMAGES["ch_bnpl_benefit"], PLACEHOLDER_VIDEO, False),
        # Bundle 4-7 (generic chapters)
        (20, 4, "Finding Your Niche", "5 mins", IMAGES["make_cents_cover"], PLACEHOLDER_VIDEO, True),
        (21, 4, "Building Your Brand", "5 mins", IMAGES["make_cents_cover"], PLACEHOLDER_VIDEO, False),
        (22, 4, "Content That Connects", "5 mins", IMAGES["make_cents_cover"], PLACEHOLDER_VIDEO, False),
        (23, 5, "Revenue Streams for Creators", "5 mins", IMAGES["make_cents_cover"], PLACEHOLDER_VIDEO, True),
        (24, 5, "Brand Partnerships 101", "5 mins", IMAGES["make_cents_cover"], PLACEHOLDER_VIDEO, False),
        (25, 5, "Scaling Your Income", "5 mins", IMAGES["make_cents_cover"], PLACEHOLDER_VIDEO, False),
        (30, 6, "Defining Your Personal Brand", "5 mins", IMAGES["beyond_profile_cover"], PLACEHOLDER_VIDEO, True),
        (31, 6, "Optimising Your LinkedIn Profile", "5 mins", IMAGES["beyond_profile_cover"], PLACEHOLDER_VIDEO, False),
        (32, 6, "Building a Compelling Headline", "5 mins", IMAGES["beyond_profile_cover"], PLACEHOLDER_VIDEO, False),
        (33, 7, "Creating Content That Resonates", "5 mins", IMAGES["beyond_profile_cover"], PLACEHOLDER_VIDEO, True),
        (34, 7, "Strategic Networking", "5 mins", IMAGES["beyond_profile_cover"], PLACEHOLDER_VIDEO, False),
        (35, 7, "Becoming a Thought Leader", "5 mins", IMAGES["beyond_profile_cover"], PLACEHOLDER_VIDEO, False),
    ]

    # Chapters for standalone bundles
    standalone_chapters = [
        (101, 101, "Who is Nicky Lim?", "8 mins", IMAGES["driven"]),
        (102, 101, "The Fastlane Mindset", "10 mins", IMAGES["driven"]),
        (103, 103, "Meet Dr. Munirah", "7 mins", IMAGES["race"]),
        (104, 103, "The Story Behind R.A.C.E", "9 mins", IMAGES["race"]),
        (105, 104, "Meet Your Instructor", "6 mins", IMAGES["illuminate"]),
        (106, 104, "What is Projection Mapping", "8 mins", IMAGES["illuminate"]),
        (107, 105, "Getting Started with Web Dev", "10 mins", IMAGES["web_dev"]),
        (108, 106, "Design Fundamentals", "8 mins", IMAGES["graphic_design"]),
        (109, 107, "Transformative Leadership", "10 mins", IMAGES["real_talk"]),
        (110, 107, "Leading Beyond Short Term", "8 mins", IMAGES["real_talk"]),
        (111, 108, "Customer Experience Intro", "7 mins", IMAGES["people_first"]),
        (112, 108, "Personalisation Matters", "9 mins", IMAGES["people_first"]),
    ]

    seq = 0
    for ch_id, series_id, title, duration, thumbnail, video_url, has_survey in chapter_data:
        seq += 1
        db.add(Chapter(id=ch_id, series_id=series_id, title=title, duration=duration, seq_no=seq, thumbnail=thumbnail))
        db.add(Content(chapter_id=ch_id, type="video", url=video_url, seq_no=1))
        if has_survey:
            db.add(Content(chapter_id=ch_id, type="survey", question=f"Quiz for {title}", options_json='[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}]', seq_no=2))

    for ch_id, series_id, title, duration, thumbnail in standalone_chapters:
        db.add(Chapter(id=ch_id, series_id=series_id, title=title, duration=duration, seq_no=1, thumbnail=thumbnail))
        db.add(Content(chapter_id=ch_id, type="video", url=PLACEHOLDER_VIDEO, seq_no=1))

    # --- Daily Videos (For You) ---
    daily_videos = [
        DailyVideo(id=1, title="BEFORE I DO", full_title="Before I Do", category="RELATIONSHIPS", description="Essential conversations for couples before marriage.", video_url=PLACEHOLDER_VIDEO, thumbnail=IMAGES["fy_before_i_do"], creator_id=1, series_count=7, total_minutes=42),
        DailyVideo(id=2, title="SIMPAN ATAU MELABUR", full_title="Simpan atau Melabur", category="FINANCE", description="Saving vs investing — make informed decisions.", video_url=PLACEHOLDER_VIDEO, thumbnail=IMAGES["fy_simpan"], creator_id=2, series_count=9, total_minutes=55),
        DailyVideo(id=3, title="MONEY TALK", full_title="Money Talk with Yuva", category="FINANCE", description="Real money management for young professionals.", video_url=PLACEHOLDER_VIDEO, thumbnail=IMAGES["fy_money_talk"], creator_id=3, series_count=6, total_minutes=35),
        DailyVideo(id=4, title="PDPA ACT", full_title="Understanding PDPA Act", category="LEGAL", description="Data protection and how it affects your business.", video_url=PLACEHOLDER_VIDEO, thumbnail=IMAGES["fy_pdpa"], creator_id=4, series_count=8, total_minutes=48),
    ]
    db.add_all(daily_videos)

    # --- Banners ---
    db.add(Banner(title="Duit Yourself", image=IMAGES["duit_yourself_banner"], color="#FFCD4B", link_type="plan", link_id="1"))
    db.add(Banner(title="Level up your career", image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", color="#67C8FF", link_type="url", link_id=""))

    db.commit()
    db.close()
    print("✅ Database seeded successfully!")
    print(f"   Default user: demo@openacademy.org / demo1234")
    print(f"   Credits: 1000")
    print(f"   Plans: 3, Bundles: {len(lesson_bundles) + len(standalone_bundles)}, Chapters: {len(chapter_data) + len(standalone_chapters)}")
    print(f"   Daily Videos: {len(daily_videos)}, Creators: {len(creators)}")


if __name__ == "__main__":
    seed()
