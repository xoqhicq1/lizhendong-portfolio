import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  Boxes,
  Crosshair,
  Gamepad2,
  Layers3,
  Mail,
  MapPin,
  MonitorCog,
  Phone,
  Radar,
  Route,
} from 'lucide-react';
import Aurora from './Aurora.jsx';

gsap.registerPlugin(ScrollTrigger);

const contacts = {
  phone: '16602072139',
  email: '1508892564@qq.com',
  location: 'Zhanjiang / Guangzhou',
};

const heroVideos = ['./assets/hero-c4d-bg.mp4', './assets/hero-bg.mp4'];

const metrics = [
  { value: '10+', label: '年游戏体验沉淀' },
  { value: '100+', label: 'MMO、MOBA类深度体验' },
  { value: 'UE5', label: '地编、建模等核心能力' },
  { value: '10+', label: '次线下活动触达、共情玩家想法' },
];

const projects = [
  {
    title: '开放世界场景地编研究',
    tag: 'World Layout',
    image: './assets/project-world-layout.png',
    detailUrl: './showcase/world-layout.html',
    description:
      '围绕探索路线、视线引导和场景节奏建立空间层次，让远景目标、近景遮挡与奖励点形成连续牵引。',
  },
  {
    title: '关卡DEMO制作',
    tag: 'Dungeon Flow',
    image: './assets/project-dungeon-flow.png',
    detailUrl: './showcase/level-demo.html',
    description:
      '以场景资产、空间层级和关卡动线为核心，展示可落地的 DEMO 搭建与视觉表达能力。',
  },
  {
    title: '硬表面道具建模练习',
    tag: '3D Modeling',
    image: './assets/project-hard-surface.png',
    detailUrl: './showcase/modeling.html',
    description:
      '面向场景资产生产的建模表达，重视轮廓识别、材质分区和可落地的制作流程。',
  },
  {
    title: '大型活动空间动线规划',
    tag: 'Live Space',
    image: './assets/project-event-space.png',
    detailUrl: './showcase/live-space.html',
    description:
      '来自音乐节和活动执行经验，关注高客流场景下的布置、服务路径与现场反馈。',
  },
];

const strengths = [
  {
    icon: Route,
    title: '关卡动线判断',
    text: '长期竞技与 MMORPG 体验带来较强的路径敏感度，能从玩家视角判断探索、战斗和反馈节奏。',
  },
  {
    icon: Layers3,
    title: '场景层次组织',
    text: '关注地形、建筑、光影与功能点之间的关系，让场景既能讲故事，也能服务玩法目标。',
  },
  {
    icon: Boxes,
    title: '建模落地意识',
    text: '理解资产从灰盒、模型到展示的完整链路，适合参与场景道具和空间氛围的早期搭建。',
  },
  {
    icon: Radar,
    title: '用户洞察与数据感',
    text: '有账号运营、问卷调研和爆款拆解经验，能把玩家反馈转化为明确的设计调整方向。',
  },
  {
    icon: MonitorCog,
    title: '执行与协作',
    text: '参与年会、音乐节、校园社群等多类现场项目，擅长拆任务、盯流程并稳定推进结果。',
  },
  {
    icon: Crosshair,
    title: '策划表达与工具使用',
    text: '能整理关卡文档、流程图、灰盒演示与作品说明，了解 UE5、Maya、C4D、Blender 等工具流程。',
  },
];

function App() {
  const [isNavFloating, setIsNavFloating] = useState(false);
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);

  useEffect(() => {
    const updateNavState = () => {
      setIsNavFloating(window.scrollY > window.innerHeight * 0.82);
    };

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', updateNavState);

    return () => {
      window.removeEventListener('scroll', updateNavState);
      window.removeEventListener('resize', updateNavState);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroVideoIndex((index) => (index + 1) % heroVideos.length);
    }, 9000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const opening = gsap.timeline({ defaults: { ease: 'power4.out' } });

      opening
        .set('.site-nav', { y: -34, autoAlpha: 0 })
        .set('.hero-poster-card', {
          clipPath: 'inset(48% 0 48% 0)',
          scaleX: 0.92,
          filter: 'contrast(1.25) brightness(0.72)',
        })
        .set('.hero-video', {
          scale: 1.2,
          yPercent: -3,
          filter: 'grayscale(0.9) contrast(1.45) brightness(0.42)',
        })
        .set('.hero-masthead span', {
          yPercent: 118,
          scaleX: 0.62,
          transformOrigin: '50% 50%',
          clipPath: 'inset(0 0 100% 0)',
        })
        .set(['.hero-content', '.hero-slogan', '.hero-index'], {
          y: 42,
          autoAlpha: 0,
        })
        .to('.hero-poster-card', {
          clipPath: 'inset(0% 0 0% 0)',
          scaleX: 1,
          filter: 'contrast(1) brightness(1)',
          duration: 1.45,
        })
        .to(
          '.hero-video',
          {
            scale: 1.08,
            yPercent: -1,
            filter: 'grayscale(0.85) contrast(1.26) brightness(0.62)',
            duration: 1.9,
          },
          '<',
        )
        .to(
          '.hero-masthead span',
          {
            yPercent: 0,
            scaleX: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.25,
          },
          '-=0.78',
        )
        .to('.site-nav', { y: 0, autoAlpha: 1, duration: 0.9 }, '-=0.75')
        .to('.hero-content', { y: 0, autoAlpha: 1, duration: 1 }, '-=0.42')
        .to(
          '.hero-slogan, .hero-index',
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.95,
            stagger: 0.12,
          },
          '-=0.7',
        );

      gsap.to('.hero-video', {
        yPercent: 5,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.utils.toArray('.section, .contact-page').forEach((section) => {
        const heading = section.querySelector('.section-heading h2, .profile-copy h2, .contact-layout h2');
        const kicker = section.querySelector('.section-kicker');
        const cards = section.querySelectorAll(
          '.metric, .project-card, .strength-card, .contact-row, .contact-note, .portrait-panel',
        );
        const media = section.querySelectorAll('.project-card img, .portrait-panel img');

        if (heading) {
          gsap.from(heading, {
            yPercent: 90,
            scaleX: 0.74,
            autoAlpha: 0,
            transformOrigin: '0% 50%',
            duration: 1.25,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
            },
          });
        }

        if (kicker) {
          gsap.from(kicker, {
            y: 32,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 76%',
            },
          });
        }

        if (cards.length) {
          gsap.from(cards, {
            y: 92,
            autoAlpha: 0,
            clipPath: 'inset(18% 0 18% 0)',
            duration: 1.15,
            ease: 'power4.out',
            stagger: 0.11,
            scrollTrigger: {
              trigger: section,
              start: 'top 68%',
            },
          });
        }

        media.forEach((item) => {
          gsap.fromTo(
            item,
            { scale: 1.16, yPercent: -4 },
            {
              scale: 1.03,
              yPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.4,
              },
            },
          );
        });
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <main>
      <header className={`site-nav${isNavFloating ? ' is-floating' : ''}`}>
        <a className="brand" href="#hero" aria-label="李振东作品集首页">
          <span>LZD</span>
          <small>LEVEL / ENVIRONMENT</small>
        </a>
        <nav aria-label="主导航">
          <a href="#experience">经历</a>
          <a href="#projects">项目</a>
          <a href="#strengths">优势</a>
          <a href="#contact">联系</a>
        </nav>
        <a className="nav-action" href="./assets/resume.pdf" target="_blank" rel="noreferrer">
          <ArrowUpRight size={18} />
          简历
        </a>
      </header>

      <section className="hero" id="hero">
        <video
          key={heroVideos[heroVideoIndex]}
          className="hero-video"
          poster="./assets/hero-poster.png"
          src={heroVideos[heroVideoIndex]}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero-shade" />
        <div className="container hero-stage">
          <div className="hero-poster-card">
            <div className="hero-masthead" aria-hidden="true">
              <span>LIZHENDONG</span>
            </div>
            <div className="hero-poster-nav" aria-hidden="true">
              <span>[PORTFOLIO]</span>
              <span>[LEVEL DESIGN]</span>
              <span>[3D MODELING]</span>
            </div>
            <div className="hero-content">
              <p className="eyebrow">LEVEL DESIGN / ENVIRONMENT ART / 3D MODELING</p>
              <p className="hero-subtitle">
                地编设计师、关卡策划、建模设计师。以玩家体验为核心组织空间、动线与场景资产，
                把游戏理解、内容洞察和执行能力转化为可落地的关卡表达。
              </p>
              <div className="hero-actions">
                <a className="primary-link" href="#projects">
                  查看精选项目
                  <ArrowUpRight size={20} />
                </a>
                <a className="ghost-link" href={`mailto:${contacts.email}`}>
                  <Mail size={19} />
                  {contacts.email}
                </a>
              </div>
            </div>
            <div className="hero-slogan">
              <strong>DESIGH</strong>
              <span>IS NOT DECORATION</span>
            </div>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">
          <span>PORTFOLIO 2026</span>
          <span>GAME FLOW STUDY</span>
        </div>
      </section>

      <div className="post-hero-shell">
        <div className="aurora-backdrop" aria-hidden="true">
          <Aurora colorStops={['#ff2a16', '#d8ad67', '#84bcb9']} blend={0.48} amplitude={0.85} speed={0.42} />
        </div>

        <section className="experience section" id="experience">
          <div className="container split-layout">
            <div className="portrait-panel">
              <img src="./assets/profile-portrait.png" alt="李振东人物视觉图" />
            </div>
            <div className="profile-copy">
              <p className="section-kicker">PROFILE</p>
              <h2>从玩家视角进入设计，从现场执行走向可落地方案。</h2>
              <p>
                目前就读于湛江科技学院工商管理专业。简历中的账号运营、活动执行与校园社群经历，
                让我对用户反馈、内容节奏、现场动线和跨角色沟通有比较直接的体感；这些能力正在转化为
                关卡策划、场景地编和建模设计中的判断力。
              </p>
              <div className="contact-strip" aria-label="联系方式">
                <a href={`tel:${contacts.phone}`}>
                  <Phone size={18} />
                  {contacts.phone}
                </a>
                <a href={`mailto:${contacts.email}`}>
                  <Mail size={18} />
                  {contacts.email}
                </a>
                <span>
                  <MapPin size={18} />
                  {contacts.location}
                </span>
              </div>
              <div className="metric-grid">
                {metrics.map((item) => (
                  <div className="metric" key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="projects section" id="projects">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">SELECTED PROJECTS</p>
                <h2>精选项目</h2>
              </div>
              <p>以空间组织、战斗节奏、资产表达和现场动线为主线，展示从想法到可读画面的设计判断。</p>
            </div>
            <div className="project-grid">
              {projects.map((project, index) => (
                <article className="project-card" key={project.title}>
                  <img src={project.image} alt={project.title} />
                  <div className="project-info">
                    <span>{project.tag}</span>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <a className="project-detail-link" href={project.detailUrl} target="_blank" rel="noreferrer">
                      查看详情 -&gt;
                    </a>
                    <small>{String(index + 1).padStart(2, '0')}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="strengths section" id="strengths">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">CAPABILITIES</p>
                <h2>个人优势</h2>
              </div>
              <p>能力组合更偏复合型：懂玩家、能拆解内容，也愿意把想法推进到具体画面和具体流程。</p>
            </div>
            <div className="strength-grid">
              {strengths.map(({ icon: Icon, title, text }) => (
                <article className="strength-card" key={title}>
                  <Icon size={26} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-page" id="contact">
          <div className="container contact-layout">
            <div>
              <p className="section-kicker">CONTACT</p>
              <h2>一起把空间、节奏和玩家动机做得更清楚。</h2>
            </div>
            <div className="contact-panel">
              <a href={`mailto:${contacts.email}`} className="contact-row">
                <Mail size={24} />
                <span>{contacts.email}</span>
                <ArrowUpRight size={22} />
              </a>
              <a href={`tel:${contacts.phone}`} className="contact-row">
                <Phone size={24} />
                <span className="contact-value">
                  {contacts.phone}
                  <small>微信同号</small>
                </span>
                <ArrowUpRight size={22} />
              </a>
              <a href="./assets/resume.pdf" target="_blank" rel="noreferrer" className="contact-row">
                <ArrowUpRight size={24} />
                <span>查看 PDF 简历</span>
                <ArrowUpRight size={22} />
              </a>
              <div className="contact-note">
                <Gamepad2 size={22} />
                <p>关卡策划 / 地编设计 / 场景建模 / 游戏运营</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
