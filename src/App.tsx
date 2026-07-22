import { useEffect, useMemo, useState } from 'react';

type PageKey =
  | 'dashboard'
  | 'duyurular'
  | 'kategoriler'
  | 'kurs-icerik'
  | 'kurs-takvim'
  | 'basvurular'
  | 'egitmenler'
  | 'sporcular'
  | 'iletisim'
  | 'kullanicilar'
  | 'profil'
  | 'static'
  | 'static-about'
  | 'static-intro'
  | 'static-contact'
  | 'static-banner';

type StaticPageFlag = 'about' | 'intro' | 'contact' | 'banner';

type MenuItem = {
  key: PageKey;
  label: string;
  icon: string;
  children?: MenuItem[];
  flag?: StaticPageFlag;
};

type Stat = {
  label: string;
  value: string;
  detail: string;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  target_role: string;
  is_active: number;
  created_at: string;
};

type Category = {
  id: number;
  name: string;
  description: string;
  status: number;
  slug: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  status: number;
  duration_minutes: number;
  capacity: number;
};

type Contact = {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: number;
  created_at: string;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: number;
};

type Application = {
  id: number;
  status: string;
  applied_at: string;
  note: string | null;
  athlete_id: number;
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_email: string;
  schedule_id: number;
  start_time: string;
  end_time: string;
  location: string;
  quota: number;
  schedule_status: string;
  course_id: number;
  course_title: string;
  category_id: number;
  category_name: string;
};

type CourseSchedule = {
  id: number;
  course_id: number;
  course_title: string;
  duration_minutes: number;
  capacity: number;
  category_name: string;
  trainer_first_name: string;
  trainer_last_name: string;
  start_time: string;
  end_time: string;
  quota: number;
  location: string;
  status: string;
};

type CourseScheduleMap = Record<string, CourseSchedule[]>;

type StaticPage = {
  id: number;
  type_flag: StaticPageFlag;
  slug: string;
  title: string;
  content: string;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type StaticPageFormState = {
  type_flag: StaticPageFlag;
  slug: string;
  title: string;
  content: string;
  status: number;
  sort_order: number;
};

type StaticPageFieldConfig = {
  key: keyof StaticPageFormState;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'number';
  options?: Array<{ value: string; label: string }>;
};

const defaultStaticPageForm: StaticPageFormState = {
  type_flag: 'about',
  slug: 'hakkinda',
  title: 'Hakkında',
  content: 'Sabit sayfa içeriğini buraya yazın.',
  status: 1,
  sort_order: 1,
};

const staticPageKeyMap: Record<StaticPageFlag, PageKey> = {
  about: 'static-about',
  intro: 'static-intro',
  contact: 'static-contact',
  banner: 'static-banner',
};

const staticPageFieldConfig: StaticPageFieldConfig[] = [
  {
    key: 'type_flag',
    label: 'type_flag',
    type: 'select',
    options: [
      { value: 'about', label: 'about' },
      { value: 'intro', label: 'intro' },
      { value: 'contact', label: 'contact' },
      { value: 'banner', label: 'banner' },
    ],
  },
  {
    key: 'slug',
    label: 'slug',
    type: 'input',
  },
  {
    key: 'title',
    label: 'title',
    type: 'input',
  },
  {
    key: 'content',
    label: 'content',
    type: 'textarea',
  },
  {
    key: 'status',
    label: 'status',
    type: 'select',
    options: [
      { value: '1', label: 'Aktif' },
      { value: '0', label: 'Pasif' },
    ],
  },
  {
    key: 'sort_order',
    label: 'sort_order',
    type: 'number',
  },
];

const weekDayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const getCurrentMonthString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthDays = (year: number, month: number): Array<string | number> => {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startIndex = (firstDay.getDay() + 6) % 7;
  const days: Array<string | number> = Array.from({ length: startIndex }, () => '');
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }
  return days;
};

const baseMenu: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Genel Bakış',
    icon: 'fa-chart-line',
  },
  {
    key: 'duyurular',
    label: 'Duyurular',
    icon: 'fa-bullhorn',
  },
  {
    key: 'kategoriler',
    label: 'Kurslar',
    icon: 'fa-graduation-cap',
    children: [
      { key: 'kategoriler', label: 'Kategoriler', icon: 'fa-tags' },
      { key: 'kurs-icerik', label: 'Kurs İçerikleri', icon: 'fa-book-open' },
      { key: 'kurs-takvim', label: 'Kurs Takvimi', icon: 'fa-calendar-alt' },
      { key: 'basvurular', label: 'Başvurular', icon: 'fa-clipboard-list' },
    ],
  },
  {
    key: 'egitmenler',
    label: 'Kişiler',
    icon: 'fa-users',
    children: [
      { key: 'egitmenler', label: 'Eğitmenler', icon: 'fa-chalkboard-teacher' },
      { key: 'sporcular', label: 'Sporcular', icon: 'fa-running' },
      { key: 'kullanicilar', label: 'Portal Kullanıcıları', icon: 'fa-user-shield' },
      { key: 'iletisim', label: 'İletişim Mesajları', icon: 'fa-envelope' },
    ],
  },
];

const initialStats: Stat[] = [
  { label: 'Toplam Kurs', value: '24', detail: 'Aktif kurs sayısı' },
  { label: 'Başvuru', value: '128', detail: 'Bekleyen başvuru' },
  { label: 'İletişim', value: '19', detail: 'Okunmamış mesaj' },
  { label: 'Üye', value: '310', detail: 'Portal kaydı' },
];

function App() {
  const [activeMenu, setActiveMenu] = useState<PageKey>('dashboard');
  const [activeStaticPageFlag, setActiveStaticPageFlag] = useState<StaticPageFlag | null>(null);
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [courseSchedules, setCourseSchedules] = useState<CourseScheduleMap>({});
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [staticPageForm, setStaticPageForm] = useState<StaticPageFormState>(defaultStaticPageForm);
  const [isStaticPageEditorOpen, setIsStaticPageEditorOpen] = useState(false);
  const [scheduleMonth, setScheduleMonth] = useState<string>(getCurrentMonthString());
  const [profile, setProfile] = useState({ first_name: 'Admin', last_name: 'Sporx', email: 'admin@sporx.com' });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) throw new Error('Duyurular yüklenemedi');
        const announcementData = await res.json();
        setAnnouncements(announcementData);
      } catch {
        setAnnouncements([]);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Kategoriler yüklenemedi');
        const categoryData = await res.json();
        setCategories(categoryData);
      } catch {
        setCategories([]);
      }
    };

    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Kurs içerikleri yüklenemedi');
        const courseData = await res.json();
        setCourses(courseData);
      } catch {
        setCourses([]);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Kullanıcılar yüklenemedi');
        const userData = await res.json();
        setUsers(userData);
      } catch {
        setUsers([]);
      }
    };

    const fetchStaticPages = async () => {
      try {
        const res = await fetch('/api/static-pages');
        if (!res.ok) throw new Error('Sabit sayfalar yüklenemedi');
        const data = await res.json();
        setStaticPages(data);
      } catch {
        setStaticPages([]);
      }
    };

    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/overview');
        if (!res.ok) throw new Error('Genel bakış verisi yüklenemedi');
        const data = await res.json();
        if (data.stats) setStatsFromData(data.stats);
        if (data.contacts) setContacts(data.contacts);
      } catch {
        setStats(initialStats);
        setContacts([]);
      }
    };

    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        if (!res.ok) throw new Error('Başvurular yüklenemedi');
        const data = await res.json();
        setApplications(data);
      } catch {
        setApplications([]);
      }
    };

    fetchAnnouncements();
    fetchCategories();
    fetchCourses();
    fetchUsers();
    fetchApplications();
    fetchStaticPages();
    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchCourseSchedules = async () => {
      try {
        const res = await fetch(`/api/course-schedules?month=${scheduleMonth}`);
        if (!res.ok) throw new Error('Kurs takvimi yüklenemedi');
        const data = await res.json();
        setCourseSchedules(data.schedule || {});
      } catch {
        setCourseSchedules({});
      }
    };

    fetchCourseSchedules();
  }, [scheduleMonth]);

  const setStatsFromData = (incoming: Array<{ label: string; value: string; detail: string }>) => {
    const mapped = incoming.map((item) => ({ label: item.label, value: item.value, detail: item.detail }));
    if (mapped.length) {
      setStats(mapped);
    }
  };

  const menu = useMemo<MenuItem[]>(() => {
    const staticChildren: MenuItem[] = staticPages
      .filter((page) => page.status === 1)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((page) => ({
        key: staticPageKeyMap[page.type_flag],
        label: page.title,
        icon: page.type_flag === 'banner' ? 'fa-images' : page.type_flag === 'contact' ? 'fa-envelope' : page.type_flag === 'intro' ? 'fa-bullseye' : 'fa-info-circle',
        flag: page.type_flag,
      } as MenuItem));

    const staticFallbackChildren: MenuItem[] = [
      { key: 'static-about', label: 'Hakkında', icon: 'fa-info-circle', flag: 'about' },
      { key: 'static-banner', label: 'Banner', icon: 'fa-images', flag: 'banner' },
    ] as MenuItem[];

    return [
      ...baseMenu.slice(0, 1),
      {
        key: 'static',
        label: 'Sabit Sayfalar',
        icon: 'fa-file-lines',
        children: staticChildren.length ? staticChildren : staticFallbackChildren,
      },
      ...baseMenu.slice(1),
    ] as MenuItem[];
  }, [staticPages]);

  const currentTitle = useMemo(() => {
    if (activeMenu === 'profil') return 'Profil';
    if (activeStaticPageFlag) {
      const page = staticPages.find((item) => item.type_flag === activeStaticPageFlag);
      return page?.title ?? 'Sabit Sayfa';
    }
    const match = menu.flatMap((item) => item.children ? [...item.children, item] : [item]).find((item) => item.key === activeMenu);
    return match?.label ?? 'Genel Bakış';
  }, [activeMenu, activeStaticPageFlag, staticPages, menu]);

  const activeStaticPage = useMemo(() => {
    if (!activeStaticPageFlag) return null;
    return staticPages.find((page) => page.type_flag === activeStaticPageFlag) ?? null;
  }, [activeStaticPageFlag, staticPages]);

  const openStaticPageEditor = (page?: StaticPage) => {
    setIsStaticPageEditorOpen(true);
    if (page) {
      setStaticPageForm({
        type_flag: page.type_flag,
        slug: page.slug,
        title: page.title,
        content: page.content,
        status: page.status,
        sort_order: page.sort_order,
      });
      return;
    }
    setStaticPageForm({ ...defaultStaticPageForm, type_flag: activeStaticPageFlag ?? 'about' });
  };

  const handleStaticPageSubmit = async () => {
    try {
      const payload = {
        ...staticPageForm,
        status: Number(staticPageForm.status),
        sort_order: Number(staticPageForm.sort_order),
      };

      const method = activeStaticPage ? 'PUT' : 'POST';
      const endpoint = activeStaticPage ? `/api/static-pages/${activeStaticPage.id}` : '/api/static-pages';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Sabit sayfa kaydedilemedi');
      const data = await res.json();
      setStaticPages((prev) => {
        if (activeStaticPage) {
          return prev.map((item) => item.id === data.id ? data : item);
        }
        return [...prev, data];
      });
      setActiveStaticPageFlag(data.type_flag);
      setIsStaticPageEditorOpen(false);
    } catch {
      alert('Sabit sayfa kaydı sırasında bir hata oluştu.');
    }
  };

  const handleStaticPageDelete = async () => {
    if (!activeStaticPage) return;
    try {
      const res = await fetch(`/api/static-pages/${activeStaticPage.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Sabit sayfa silinemedi');
      setStaticPages((prev) => prev.filter((page) => page.id !== activeStaticPage.id));
      setActiveStaticPageFlag(null);
      setIsStaticPageEditorOpen(false);
    } catch {
      alert('Sabit sayfa silinirken hata oluştu.');
    }
  };

  const renderSection = () => {
    if (activeMenu === 'static') {
      return (
        <div className="page-section active">
          <div className="card">
            <div className="card-header">
              <h2>Sabit Sayfa Yönetimi</h2>
              <button className="btn" onClick={() => openStaticPageEditor()}>
                + Yeni Sayfa
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Tip</th>
                  <th>Slug</th>
                  <th>Durum</th>
                  <th>Sıra</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {staticPages.map((page) => (
                  <tr key={page.id}>
                    <td>{page.title}</td>
                    <td>{page.type_flag}</td>
                    <td>{page.slug}</td>
                    <td><span className={`badge ${page.status ? 'badge-success' : 'badge-warning'}`}>{page.status ? 'Aktif' : 'Pasif'}</span></td>
                    <td>{page.sort_order}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" onClick={() => {
                          setActiveStaticPageFlag(page.type_flag);
                          setActiveMenu(staticPageKeyMap[page.type_flag]);
                          openStaticPageEditor(page);
                        }}>Düzenle</button>
                        <button className="btn" onClick={async () => {
                          const res = await fetch(`/api/static-pages/${page.id}`, { method: 'DELETE' });
                          if (res.ok) {
                            setStaticPages((prev) => prev.filter((item) => item.id !== page.id));
                            if (activeStaticPageFlag === page.type_flag) setActiveStaticPageFlag(null);
                          }
                        }}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isStaticPageEditorOpen ? (
            <div className="card" style={{ marginTop: '16px' }}>
              <div className="card-header">
                <h2>{activeStaticPage ? 'Sayfa Düzenle' : 'Yeni Sayfa Ekle'}</h2>
              </div>
              <div className="profile-form">
                {staticPageFieldConfig.map((field) => {
                  const value = staticPageForm[field.key];

                  return (
                    <div key={field.key}>
                      <label>{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea className="form-control" rows={6} value={String(value)} onChange={(event) => setStaticPageForm({ ...staticPageForm, [field.key]: event.target.value })} />
                      ) : field.type === 'select' ? (
                        <select className="form-control" value={String(value)} onChange={(event) => {
                          const nextValue = field.key === 'status' ? Number(event.target.value) : event.target.value;
                          setStaticPageForm({ ...staticPageForm, [field.key]: nextValue as never });
                        }}>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="form-control"
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={String(value)}
                          onChange={(event) => {
                            const nextValue = field.type === 'number' ? Number(event.target.value) : event.target.value;
                            setStaticPageForm({ ...staticPageForm, [field.key]: nextValue as never });
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={handleStaticPageSubmit}>Kaydet</button>
                  <button className="btn" onClick={() => setIsStaticPageEditorOpen(false)}>İptal</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (activeMenu.startsWith('static-')) {
      const page = activeStaticPage;

      if (!page) {
        return <PageContent title="Sabit Sayfa" description="Seçilen sabit sayfa verisi yükleniyor..." />;
      }

      return (
        <div className="page-section active">
          <div className="card">
            <div className="card-header">
              <h2>{page.title}</h2>
              <button className="btn" onClick={() => openStaticPageEditor(page)}>Düzenle</button>
            </div>
            <p>{page.content}</p>
            <div className="info-box">Bu içerik type_flag tabanlı olarak yönetilir ve yeni sayfalar aynı yapı ile kolayca çoğaltılabilir.</div>
          </div>
        </div>
      );
    }

    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="page-section active">
            <div className="card-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="card stat-card">
                  <h3>{stat.label}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <p>{stat.detail}</p>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-header">
                <h2>Panel Özeti</h2>
                <button className="btn">+ Yeni</button>
              </div>
              <p>Bu sayfa, kurumsal verilerle desteklenen dinamik bir kontrol ekranıdır. Menülerden ilgili sayfaya geçebilirsiniz.</p>
            </div>
          </div>
        );
      case 'duyurular':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Duyurular</h2>
                <button className="btn">+ Yeni Duyuru</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Hedef</th>
                    <th>Durum</th>
                    <th>Oluşturma</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement) => (
                    <tr key={announcement.id}>
                      <td>{announcement.title}</td>
                      <td>{announcement.target_role}</td>
                      <td><span className={`badge ${announcement.is_active ? 'badge-success' : 'badge-warning'}`}>{announcement.is_active ? 'Aktif' : 'Taslak'}</span></td>
                      <td>{announcement.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'kategoriler':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Kurs Kategorileri</h2>
                <button className="btn">+ Kategori Ekle</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>Slug</th>
                    <th>Açıklama</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.slug}</td>
                      <td>{category.description}</td>
                      <td><span className={`badge ${category.status ? 'badge-success' : 'badge-warning'}`}>{category.status ? 'Aktif' : 'Pasif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'kurs-icerik':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Kurs İçerikleri</h2>
                <button className="btn">+ Kurs Ekle</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Süre</th>
                    <th>Kapasite</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>{course.duration_minutes} dk</td>
                      <td>{course.capacity}</td>
                      <td><span className={`badge ${course.status ? 'badge-success' : 'badge-warning'}`}>{course.status ? 'Aktif' : 'Pasif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'kurs-takvim':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Kurs Takvimi</h2>
                <div>
                  <button className="btn" onClick={() => setScheduleMonth((prev) => {
                    const [year, month] = prev.split('-').map(Number);
                    const date = new Date(year, month - 2, 1);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  })}>
                    Önceki Ay
                  </button>
                  <button className="btn" style={{ marginLeft: '8px' }} onClick={() => setScheduleMonth((prev) => {
                    const [year, month] = prev.split('-').map(Number);
                    const date = new Date(year, month, 1);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  })}>
                    Sonraki Ay
                  </button>
                </div>
              </div>
              <div className="calendar-toolbar">
                <div className="calendar-month">{scheduleMonth}</div>
              </div>
              <div className="calendar-grid">
                {weekDayNames.map((day) => (
                  <div key={day} className="calendar-header">{day}</div>
                ))}
                {getMonthDays(Number(scheduleMonth.split('-')[0]), Number(scheduleMonth.split('-')[1])).map((day, index) => {
                  if (!day) return <div key={`empty-${index}`} className="calendar-day empty" />;
                  const dateKey = `${scheduleMonth}-${String(day).padStart(2, '0')}`;
                  const events = courseSchedules[dateKey] || [];
                  return (
                    <div key={dateKey} className="calendar-day">
                      <div className="day-number">{day}</div>
                      {events.map((event) => (
                        <div key={event.id} className="calendar-event">
                          <strong>{event.course_title}</strong>
                          <div>{event.trainer_first_name} {event.trainer_last_name}</div>
                          <div>{new Date(event.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div>{event.location}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'basvurular':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Başvurular</h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Sporcu</th>
                    <th>Kurs</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>Not</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.athlete_first_name} {application.athlete_last_name}</td>
                      <td>{application.course_title}</td>
                      <td>{new Date(application.start_time).toLocaleString('tr-TR')}</td>
                      <td><span className={`badge ${application.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>{application.status}</span></td>
                      <td>{application.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'egitmenler':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Eğitmenler</h2>
                <button className="btn">+ Eğitmen Ekle</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>E-posta</th>
                    <th>Rol</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter((user) => user.role !== 'athlete').map((user) => (
                    <tr key={user.id}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td><span className={`badge ${user.status ? 'badge-success' : 'badge-warning'}`}>{user.status ? 'Aktif' : 'Pasif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'sporcular':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Sporcular</h2>
                <button className="btn">+ Sporcu Ekle</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>E-posta</th>
                    <th>Rol</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter((user) => user.role === 'athlete').map((user) => (
                    <tr key={user.id}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td><span className={`badge ${user.status ? 'badge-success' : 'badge-warning'}`}>{user.status ? 'Aktif' : 'Pasif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'iletisim':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>İletişim Mesajları</h2>
                <button className="btn">Mark as read</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>Konu</th>
                    <th>Durum</th>
                    <th>Oluşturma</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.full_name}</td>
                      <td>{contact.subject}</td>
                      <td><span className={`badge ${contact.is_read ? 'badge-success' : 'badge-warning'}`}>{contact.is_read ? 'Okundu' : 'Yeni'}</span></td>
                      <td>{contact.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'kullanicilar':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header">
                <h2>Portal Kullanıcıları</h2>
                <button className="btn">+ Kullanıcı Ekle</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>E-posta</th>
                    <th>Rol</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td><span className={`badge ${user.status ? 'badge-success' : 'badge-warning'}`}>{user.status ? 'Aktif' : 'Pasif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="page-section active">
            <div className="card">
              <div className="card-header"><h2>Profil Ayarları</h2></div>
              <div className="profile-form">
                <label>Ad</label>
                <input className="form-control" value={profile.first_name} onChange={(event) => setProfile({ ...profile, first_name: event.target.value })} />
                <label>Soyad</label>
                <input className="form-control" value={profile.last_name} onChange={(event) => setProfile({ ...profile, last_name: event.target.value })} />
                <label>E-posta</label>
                <input className="form-control" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
                <label>Yeni Şifre</label>
                <input className="form-control" type="password" placeholder="Şifre belirleyin" />
                <button className="btn" style={{ marginTop: '12px' }}>Kaydet</button>
              </div>
            </div>
          </div>
        );
      default:
        return <PageContent title="Sayfa" description="İçerik yükleniyor..." />;
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <i className="fa-solid fa-dumbbell" /> <span>SPORX</span>
        </div>
        <ul className="nav-menu">
          {menu.map((item) => (
            <li key={item.key} className="nav-item">
              {item.children ? (
                <>
                  <div className="nav-link dropdown-trigger" onClick={() => {
                    setActiveMenu(item.children?.[0]?.key ?? item.key);
                    setActiveStaticPageFlag(item.children?.[0]?.flag ?? null);
                  }}>
                    <i className={`fa-solid ${item.icon}`} />
                    <span>{item.label}</span>
                    <i className="fa-solid fa-chevron-right arrow" />
                  </div>
                  <div className="submenu open">
                    {item.children.map((child) => (
                      <a key={`${child.label}-${child.flag ?? 'root'}`} className={`nav-link ${activeMenu === child.key ? 'active' : ''}`} onClick={() => {
                        setActiveMenu(child.key);
                        setActiveStaticPageFlag(child.flag ?? null);
                      }}>
                        <i className={`fa-solid ${child.icon}`} />
                        <span>{child.label}</span>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <a className={`nav-link ${activeMenu === item.key ? 'active' : ''}`} onClick={() => setActiveMenu(item.key)}>
                  <i className={`fa-solid ${item.icon}`} />
                  <span>{item.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </aside>
      <div className="main-wrapper">
        <header>
          <div className="header-title">{currentTitle}</div>
          <div className="user-profile">
            <button className="profile-btn" onClick={() => setActiveMenu('profil')}>
              <span className="avatar">A</span>
              <span>{profile.first_name} {profile.last_name}</span>
            </button>
          </div>
        </header>
        <main className="content">{renderSection()}</main>
      </div>
    </div>
  );
}

function PageContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="page-section active">
      <div className="card">
        <div className="card-header">
          <h2>{title}</h2>
          <button className="btn">Düzenle</button>
        </div>
        <p>{description}</p>
        <div className="info-box">Bu alan, veritabanında saklanacak içerikler için hazırlanmış dinamik bir yönetim alanıdır.</div>
      </div>
    </div>
  );
}

export default App;
