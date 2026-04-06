import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.blog_project import BlogPost, Project
from app.models.user import User
from app.core.security import hash_password
from app.core.config import settings

ARTICLES = [
    {
        "slug": "role-of-technology-oil-gas-safety",
        "category": "INDUSTRY TRENDS",
        "title": "The Role of Technology in Improving Safety and Efficiency in the Oil and Gas Industry",
        "excerpt": "The oil and gas industry has always been crucial for powering industries, transportation, and economic growth. Modern digital monitoring systems, smart sensors, and automated control technologies have fundamentally transformed how operations are conducted.",
        "author": "Asaba Oghenegoma Godspower",
        "featured_image": "/images/blog-featured.jpg",
        "content": """
          <p>The oil and gas industry has always been crucial for powering industries, transportation, and economic growth. In the early years of the industry, especially between the 1900s and 1970s, operations relied heavily on manual labor and basic mechanical equipment. Major companies such as Standard Oil, Royal Dutch Shell, and BP operated with limited monitoring technology compared to today.</p>
          <p>During this period, engineers had to physically inspect pipelines, pumps, and processing equipment to detect leaks or mechanical faults. Technicians manually read pressure gauges and temperature meters during routine inspections. These inspections were not continuous, so problems were sometimes discovered late, which could lead to accidents or equipment failure.</p>
          <p>Drilling operations in the 1940s to 1970s were also mostly vertical. Companies relied heavily on geological predictions to locate oil reservoirs. If the well missed the target, another well had to be drilled, increasing both cost and time. Oilfield service companies such as Schlumberger and Halliburton began introducing better logging tools during this time, but the technology was still limited compared to modern standards.</p>
          <p>Today, the industry has changed significantly. Modern oil and gas facilities use digital monitoring systems, smart sensors, and automated control technologies that continuously measure pressure, temperature, vibration, and flow rates in real time. Engineers can monitor these systems from centralized control rooms and receive immediate alerts if abnormal conditions occur.</p>
          <p>Drilling technology has also advanced through directional and horizontal drilling, allowing operators to precisely reach reservoirs that were once difficult to access. Companies like ExxonMobil and Chevron now use advanced drilling and data technologies to increase production while reducing environmental impact.</p>
          <p>Maintenance practices have also improved. Instead of waiting for equipment to fail, modern facilities use predictive maintenance systems that analyze equipment data to detect potential problems before they occur. This reduces downtime, improves safety, and saves operational costs.</p>
          <p>In summary, the oil and gas industry has significantly transformed from traditional manual methods to advanced technology-driven operations. While older methods laid the foundation for the industry, modern technologies have made operations safer, more efficient, and more environmentally responsible.</p>
        """,
        "is_published": True
    },
    {
        "slug": "instrumentation-fittings-critical-oil-gas-operations",
        "category": "ENGINEERING",
        "title": "Why Instrumentation Fittings Are Critical in Oil and Gas Operations",
        "excerpt": "The oil and gas industry operates in one of the most demanding industrial environments in the world. From offshore drilling platforms to onshore refineries and petrochemical plants, the need for reliable equipment is critical. Among the many components that ensure safe and efficient operations, instrumentation fittings and connectors play a vital role.",
        "author": "Faniyi Timilehin Esther",
        "featured_image": "/testing-calibration.jpg",
        "content": """
          <p>The oil and gas industry operates in one of the most demanding industrial environments in the world. From offshore drilling platforms to onshore refineries and petrochemical plants, the need for reliable equipment is critical. Among the many components that ensure safe and efficient operations, instrumentation fittings and connectors play a vital role.</p>
          <p>Instrumentation fittings are mechanical components used to connect pipes, tubes, valves, and other equipment in process control systems. They ensure the secure transfer of fluids, gases, and pressure signals across different parts of an industrial system.</p>
          <p>Instrumentation fittings include Tube fittings, Compression fittings, Filling and flushing connectors, Needle valves and Manifold valves. These components are designed to maintain leak-proof connections, even under high pressure and extreme temperatures.</p>
          <p>Using high-quality fittings helps ensure accurate readings from instruments, prevents leaks, and reduces maintenance downtime. Although they may seem small, instrumentation fittings play a vital role in maintaining safe, efficient, and reliable oil and gas operations.</p>
          <p>At Rewaj, we are committed to providing high-quality industrial components that support the performance and safety of oil and gas systems.</p>
        """,
        "is_published": True
    },
    {
         "slug": "instrumentation-fittings-critical-oil-gas-operations",
        "category": "INDUSTRY NEWS",
        "title": "The Role of Artificial Intelligence in Oil Exploration",
        "excerpt": "Artificial intelligence is revolutionizing the way oil and gas companies approach exploration and production. From predictive analytics to autonomous drilling, AI technologies are enhancing efficiency, reducing risks, and optimizing resource extraction.",
        "author": "Chukwubuikem Progress Anene",
        "featured_image": "/team-offshore.jpg",
        "content": """
          <p>Artificial Intelligence (AI) is transforming the oil and gas industry, especially in exploration, where vast amounts of geological and operational data must be analyzed to make critical decisions. Traditionally, teams of geoscientists and engineers spent weeks interpreting seismic surveys, drilling logs, and reservoir data. AI now enhances this process by quickly detecting patterns and insights that would take humans much longer to identify, improving both accuracy and efficiency. Machine learning models analyze seismic data to locate potential hydrocarbon reservoirs, optimize drilling parameters, and forecast reservoir performance, augmenting human expertise rather than replacing it. By combining historical production data with geological information, AI enables engineers to make better-informed decisions, reduce uncertainty, and plan exploration strategies more effectively.</p>
          <p>Safety is a top priority in oil exploration, and AI contributes by monitoring equipment and operations in real time. Predictive maintenance detects early signs of equipment failure before they escalate, while AI-driven hazard prediction identifies potential drilling risks, helping companies prevent accidents and minimize downtime. These intelligent systems not only protect personnel but also improve operational efficiency, ensuring exploration activities proceed safely even in challenging environments.</p>
          <p>The industry is also moving toward digital oilfields, where AI, automation, and advanced analytics drive operations. This shift allows companies to reduce exploration costs, make faster decisions, and allocate resources more efficiently. Real-world applications demonstrate AI’s impact: seismic interpretation has become faster and more precise, drilling systems automatically adjust parameters to optimize performance, and reservoir performance can now be forecasted using historical data from similar fields. These examples show how AI delivers measurable improvements while addressing complex challenges that have long faced exploration teams.</p>
          <p>By turning raw data into actionable intelligence, AI improves problem-solving across the exploration process. It helps companies reduce drilling uncertainty, enhance accuracy, minimize downtime, and maximize the value of exploration projects. As the oil and gas industry evolves, AI will continue to play an essential role, enabling professionals to work smarter, safer, and more efficiently. Companies embracing AI today are positioning themselves for a more intelligent, data-driven, and competitive future in oil exploration.</p>
        """,
        "is_published": True
    }
]

PROJECTS = [
    { "slug": "power-system-maintenance", "category": "Power Systems", "tag": "MAINTENANCE", "title": "Power System Maintenance", "description": "Comprehensive overhaul and routine maintenance of HV/LV power distribution units for an offshore production platform, ensuring zero-downtime operations.", "completion_year": "2023", "featured_image": "/images/project-power.jpg", "is_active": True, "client_name": "Total Energies" },
    { "slug": "fire-suppression-upgrades", "category": "Fire Suppression", "tag": "FIRE SAFETY", "title": "Fire Suppression Upgrades", "description": "Installation and commissioning of advanced FM-200 and CO2 suppression systems across multiple remote terminal units (RTUs) for a major IOC.", "completion_year": "2023", "featured_image": "/images/project-fire.jpg", "is_active": True, "client_name": "Shell" },
    { "slug": "automation-systems", "category": "Automation", "tag": "AUTOMATION", "title": "Automation Systems", "description": "Deployment of PLC-based integrated control systems for pipeline pressure monitoring and emergency shutdown (ESD) synchronization.", "completion_year": "2022", "featured_image": "/images/project-automation.jpg", "is_active": True, "client_name": "Renaissance Africa Energy" },
    { "slug": "smart-instrumentation-grid", "category": "Technical Services", "tag": "INSTRUMENTATION", "title": "Smart Instrumentation Grid", "description": "Design and installation of high-precision flowmeters and telemetry systems for real-time crude oil transfer monitoring.", "completion_year": "2022", "featured_image": "/images/project-instrumentation.jpg", "is_active": True, "client_name": "Seplat Energy" },
    { "slug": "gas-processing-plant-retrofit", "category": "Technical Services", "tag": "ENGINEERING", "title": "Gas Processing Plant Retrofit", "description": "Full-scale electrical and mechanical retrofit of an aging natural gas processing facility to meet modern environmental standards.", "completion_year": "2021", "featured_image": "/images/project-gas.jpg", "is_active": True, "client_name": "NLNG" },
    { "slug": "risk-assessment-audits", "category": "Technical Services", "tag": "CONSULTING", "title": "Risk Assessment Audits", "description": "Delivering comprehensive HAZOP and SIL studies for multi-billion dollar brownfield expansion projects across the Niger Delta.", "completion_year": "2021", "featured_image": "/images/project-risk.jpg", "is_active": True, "client_name": "Shell" }
]

async def seed():
    # Ensure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Seed Articles
        for art_data in ARTICLES:
            existing = await db.scalar(select(BlogPost).where(BlogPost.slug == art_data["slug"]))
            if not existing:
                db.add(BlogPost(**art_data))
        
        # Seed Projects
        for proj_data in PROJECTS:
            existing = await db.scalar(select(Project).where(Project.slug == proj_data["slug"]))
            if not existing:
                db.add(Project(**proj_data))
        
        # Seed Admin
        admin_email = settings.ADMIN_EMAIL_DEFAULT
        existing_admin = await db.scalar(select(User).where(User.email == admin_email))
        if not existing_admin:
            admin = User(
                email=admin_email,
                hashed_password=hash_password(settings.ADMIN_PASSWORD_DEFAULT),
                full_name="Site Administrator",
                is_active=True,
                is_admin=True,
            )
            db.add(admin)
            print(f"Admin user created: {admin_email}")

        await db.commit()
        print("Content seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
