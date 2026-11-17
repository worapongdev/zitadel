# Custom login ของ saas-infra-template

Branch `custom-login` คือหน้า login ของ ZITADEL รุ่น **v4.15.3** ที่แก้ให้เข้ากับหน้าสมัครของ Platform
(ADR-0017 ใน repository `saas-infra-template`) รุ่นของ branch นี้ต้องตรงกับรุ่นของ ZITADEL ที่ใช้งานเสมอ

## สิ่งที่แก้จากต้นฉบับ

| ไฟล์ | การแก้ |
|---|---|
| `src/components/dynamic-theme.tsx` | โครงหน้าใหม่ทั้งหมด: เต็มจอ แถบแบรนด์ซ้าย (โลโก้หรืออักษรแรกของชื่อ, ชื่อผลิตภัณฑ์, หัวข้อ, ข้อความช่วยเหลือ) หัวข้อของหน้าและฟอร์มอยู่ขวา จอแคบกว่า 860px แถบแบรนด์ย่อเป็นส่วนหัว |
| `src/components/dynamic-theme.test.tsx` | test ของโครงหน้าใหม่ (ของเรา) |
| `src/styles/globals.scss` | CSS ของโครงหน้า (`.cl-*`) ทุกเฉดสีคำนวณจากสีหลักของ branding; ขนาดช่องกรอกและปุ่ม; ฟอนต์ที่มีอักษรไทย |
| `src/app/(login)/layout.tsx` | เต็มจอ ไม่มีการ์ดบนพื้นเทา; ตัดตัวเลือกภาษาและปุ่มสลับธีม; เลิกใช้ฟอนต์ Lato |
| `src/components/theme-provider.tsx` | บังคับธีมสว่างธีมเดียว |
| `locales/en.json` | ข้อความ `brand.name`, `brand.headline` (ค่าเริ่มต้น) ของแถบแบรนด์ |
| `src/lib/theme.ts`, `src/lib/theme.test.ts` | ค่าเริ่มต้นของ layout เป็น `side-by-side` |
| `src/components/brand-text.tsx` (ของเรา) | อ่านข้อความที่ deployment อาจไม่ใส่ (`useOptionalText`) และป้ายเหนือหัวข้อ (`StepChip`) |
| `src/components/back-link.tsx` (ของเรา) | "ย้อนกลับ" แบบลิงก์ข้อความเหนือหัวข้อ |
| `src/components/input.tsx` | เพิ่ม prop `icon` (ไอคอนในช่อง ด้านซ้าย) และ `trailing` (ปุ่มในช่อง ด้านขวา) |
| `src/components/username-form.tsx` | ไอคอนซองจดหมาย, placeholder, ปุ่มเต็มความกว้าง, ลิงก์ "สร้างบัญชี" ไปหน้าสมัครของ Platform |
| `src/components/password-form.tsx` | ปุ่มแสดง/ซ่อนรหัสผ่าน, "ลืมรหัสผ่าน?" ชิดขวา, ปุ่มเต็มความกว้าง, ปุ่มย้อนกลับแบบรอง |
| `src/components/password-input.tsx` (ของเรา) | ช่องรหัสผ่านพร้อมปุ่มแสดง/ซ่อน ใช้ใน `password-form`, `set-password-form`, `change-password-form`, `set-register-password-form` |
| `src/components/back-button.tsx`, `src/components/alert.tsx` | เพิ่ม class (`cl-back`, `cl-alert`) ให้ CSS จัดหน้าตา |
| `src/i18n/request.ts` | ข้อความระดับ instance เป็นฐาน แล้วทับด้วยข้อความของ organization (ต้นฉบับใช้ของ organization อย่างเดียวเมื่อ URL มี `organization=` หน้าจึงกลับเป็นภาษาอังกฤษ) |
| `src/components/user-avatar.tsx` | กล่องบัญชีแบบใหม่พร้อมลิงก์ "เปลี่ยน" |
| `src/app/(login)/loginname/page.tsx`, `src/app/(login)/password/page.tsx` | ลิงก์ย้อนกลับและป้ายขั้นตอนเหนือหัวข้อ |
| `Dockerfile.custom` (+ `.dockerignore`) | build ทั้งหมดใน Docker |

แถวปุ่มท้ายฟอร์ม (ย้อนกลับ + ดำเนินการต่อ) ของทุกหน้าจัดด้วย CSS ใน `globals.scss` ที่จับ utility class ของต้นฉบับ
(`flex w-full flex-row items-center` + `mt-8`/`mt-4`) จึงไม่ต้องแก้ไฟล์ฟอร์มทีละไฟล์ ถ้าอัปเกรดแล้วปุ่มกลับเป็นแบบเดิม ให้ดูว่า class ของแถวนั้นเปลี่ยนหรือไม่

ข้อความของแถบแบรนด์ (`brand.name`, `brand.headline`, `brand.text`, `brand.help`) มาจากข้อความแปลใน ZITADEL
เหมือนข้อความอื่น: `zitadel/login-texts.ps1` ใส่ชื่อผลิตภัณฑ์และข้อความช่วยเหลือจาก `.env` ของ `saas-infra-template` ให้

ข้อความเสริมที่ไม่มีในต้นฉบับ: `brand.signupUrl`, `brand.signupPrompt`, `brand.signupLink` (ลิงก์สร้างบัญชี
แสดงเมื่อมี URL ที่ขึ้นต้นด้วย `https://` หรือ `/`), `brand.change`, `brand.showPassword`, `brand.hidePassword`,
`loginname.step`, `loginname.placeholder`, `password.verify.step` ข้อความที่ไม่มีจะไม่แสดงส่วนนั้น

สี โลโก้ และข้อความภาษาไทย **ไม่ได้อยู่ในโค้ดนี้** มาจากการตั้งค่าใน ZITADEL:
สีจาก Terraform (`zitadel/terraform/branding.tf`) และข้อความจาก `zitadel/login-texts.ps1` ใน `saas-infra-template`

## Build image

รันจาก**รากของ repository นี้** (ไม่ใช่ใน `apps/login`):

```
docker build -f apps/login/Dockerfile.custom -t saas-zitadel-login:v4.15.3-custom.1 .
```

- ครั้งแรกใช้เวลาหลายนาทีและต้องต่ออินเทอร์เน็ต (npm registry และ buf.build)
- ทุกครั้งที่แก้โค้ด ให้เพิ่มเลขท้าย tag (`-custom.2`, `-custom.3`) อย่าใช้ tag เดิมซ้ำ

## ใช้กับ saas-infra-template

ตั้งใน `.env` ของ `saas-infra-template` แล้วสร้าง container ใหม่:

```
ZITADEL_LOGIN_IMAGE=saas-zitadel-login:v4.15.3-custom.1
```

```
docker compose up -d zitadel-login
```

กลับไปใช้ image ต้นฉบับ: ลบบรรทัดนั้นออกจาก `.env` แล้วรันคำสั่งเดิม

## พัฒนาแบบเห็นผลทันที (ไม่บังคับ)

ต้องมี Node.js ตาม `.nvmrc` และรันใน shell แบบ Linux (WSL หรือ Git Bash) เพราะ script ใช้คำสั่งของ Unix:

```
corepack enable
pnpm install --frozen-lockfile
pnpm nx run @zitadel/login:dev
```

ตั้ง `ZITADEL_API_URL` และ `ZITADEL_SERVICE_USER_TOKEN` ใน `apps/login/.env.dev.local` (ห้าม commit)

## อัปเกรดตาม ZITADEL

```
git fetch --tags
git switch custom-login
git merge --no-ff vX.Y.Z
```

แก้จุดที่ชนกัน (ควรอยู่ในไฟล์ข้างบน) แก้เลขรุ่นในไฟล์นี้และใน tag ของ image แล้ว build ใหม่
และอัปเกรด image ของ ZITADEL ใน `saas-infra-template` เป็นรุ่นเดียวกัน
