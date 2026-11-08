DRAFT — not legal advice — requires review by a Malaysian-qualified lawyer before publication

# Privacy notice: draft text and legal grounding

Prepared 8 November 2026. All web sources were accessed on 8 November 2026.

This file has three parts:

- **Part A (for the owner and counsel, not for publication):** the legal framework, what was verified and where, and what the notice must contain.
- **Part B (the draft notice):** plain-English text intended for readers. It describes the code as it stands at commit `2a9302b5`, row for row with `data-inventory.md`. Bracketed `[EDITOR NOTE]` lines flag places where a code change would let the wording become simpler or more reassuring. Bracketed `[PLACEHOLDERS]` are for the owner to fill.
- **Questions for counsel:** at the end.

---

## Part A. Legal grounding (not for publication)

### A1. Primary sources used

| Ref | Source | Where | Notes |
|---|---|---|---|
| P1 | Personal Data Protection Act 2010 (Act 709), Reprint as at 15 September 2026, Commissioner of Law Revision | https://www.pdp.gov.my/wp-content/uploads/2026/10/Akta-709-cetakan-semula-2026-BI.pdf (linked from https://www.pdp.gov.my/en/akta/personal-data-protection-act-2010-reprint/) | Official reprint. Front matter (p. 2) lists Act A1727 as the latest amendment, with the commencement dates in A3 below. Page numbers below are the reprint's printed page numbers |
| P2 | Personal Data Protection (Amendment) Act 2024 (Act A1727). Royal Assent 9 October 2024; published in the Gazette 17 October 2024 | Gazetted text, copy hosted by Christopher & Lee Ong: https://christopherleeong.com/wp-content/uploads/2024/12/PDPA-Amendment-Act-A1727.pdf | A law-firm copy of the gazetted Act. Its content matches the amendments incorporated in P1 |
| P3 | P.U.(B) 522, Personal Data Protection (Amendment) Act 2024: Appointment of Date of Coming into Operation. Dated 19 December 2024; published 24 December 2024; made by Gobind Singh Deo, Minister of Digital | Gazette copy hosted by Christopher & Lee Ong: https://christopherleeong.com/wp-content/uploads/2024/12/PDPA-Amendment-PUB.pdf | Dates cross-checked against the official reprint front matter (P1, p. 2): they match |
| P4 | Jabatan Perlindungan Data Peribadi (JPDP) web pages: scope of the Act; the 13 classes of data controller; registration guide; DPO registration guide; data breach notification report page | https://www.pdp.gov.my/en/akta/application-and-non-application-of-the-act/ ; https://www.pdp.gov.my/en/relevant-documents/ ; https://www.pdp.gov.my/en/registration-guide/ ; https://www.pdp.gov.my/en/data-protection-officer-registration-guide/ ; https://www.pdp.gov.my/data-breach-notification-dbn-report/ | The DPO and breach pages link only to user manuals for the portals. The two Guidelines themselves were not found on pdp.gov.my during this research |
| S1 | DLA Piper, "Malaysia: Guidelines Issued on Data Breach Notification and Data Protection Officer Appointment" (March 2025) | https://privacymatters.dlapiper.com/2025/03/malaysia-guidelines-issued-on-data-breach-notification-and-data-protection-officer-appointment/ | **Secondary source.** Used only for the Guidelines' thresholds and timelines, which counsel must check against the official Guidelines |
| P5 | Cloudflare Privacy Policy, effective 4 November 2025 | https://www.cloudflare.com/privacypolicy/ | Cloudflare describes itself as a data processor for content provided by customers and end users, and says it processes end users' IP addresses and traffic data |
| P6 | Cloudflare documentation, "How KV works" | https://developers.cloudflare.com/kv/concepts/how-kv-works/ | KV "stores data in a small number of centralized data centers" and caches it elsewhere after access |
| P7 | Cloudflare documentation, "Workers Logs" | https://developers.cloudflare.com/workers/observability/logs/workers-logs/ | New Workers have logging on by default; retention 3 days (Free) or 7 days (Paid) |

### A2. Does the PDPA apply to T4A?

Probably yes in part, but the point is arguable either way, and that is the first question for counsel. The verified statutory text:

- **Application (s.2(1), P1 p. 11):** the Act applies to any person who processes, or controls or authorises the processing of, "any personal data in respect of commercial transactions".
- **"Commercial transactions" (s.4, P1 p. 17):** "any transaction of a commercial nature, whether contractual or not, which includes any matters relating to the supply or exchange of goods or services, agency, investments, financing, banking and insurance". T4A supplies free services (sync, notifications) with no advertising. Whether that is "of a commercial nature" depends on facts only the owner knows: how T4A is funded, any donations, sponsorship or paid products, and any plan to monetise.
- **"Personal data" (s.4, P1 p. 13):** information "that relates directly or indirectly to a data subject, who is identified or identifiable from that information or from that and other information in the possession of a data controller". T4A collects no names, emails or phone numbers. The sync record is keyed to a random code; the push record is keyed to a browser-vendor URL. Against that: IP addresses pass through the workers' memory, and Cloudflare logs (which the owner may be able to view in the dashboard) can pair an IP address with a request URL that contains the Angle Code. Whether that counts as information "in the possession of" T4A is the second question for counsel.
- **Territorial reach (s.2(2) and s.2(4), P1 pp. 11 to 12):** the Act applies to a person "established in Malaysia" (including an individual present in Malaysia at least 180 days a calendar year, or a body incorporated in Malaysia), whether or not the processing happens in the context of that establishment.
- **Non-application (s.3, P1 p. 13):** the Act does not apply to federal and state governments, or "to any personal data processed outside Malaysia unless that personal data is intended to be further processed in Malaysia". The data sits on Cloudflare, probably outside Malaysia (P6). How s.3(2) interacts with s.2(2)(a) for a Malaysian-established controller using foreign infrastructure is for counsel.
- **Exemption for journalism (s.45(2)(f), P1 p. 50):** personal data "processed only for journalistic, literary or artistic purposes" is exempt from the General, Notice and Choice, Disclosure, Retention, Data Integrity and Access Principles, subject to conditions in s.45(2)(f)(i) to (iii). This may help with personal data **about people named in issues**. It does not obviously cover **reader** data (sync and push), which is not processed for journalistic purposes.
- **Sensitive personal data (s.4, P1; s.40, P1):** includes a data subject's "political opinions, his religious beliefs or other beliefs of a similar nature". Processing requires explicit consent (s.40(1)(a)). A reading history and highlights across issues on politics, religion and royalty could arguably reveal opinions or beliefs. This is the third question for counsel.

**Recommendation for the owner:** publish a notice that would satisfy s.7 if the Act applies. The cost is small, the trust value is high, and the scope arguments are contestable. Part B is drafted to that standard.

### A3. What the 2024 amendments changed, with verified commencement dates

The gazette notice P.U.(B) 522 (P3) appoints three dates. The official reprint (P1, p. 2) records the same dates.

| Act A1727 section | Effect on Act 709 | In force | Relevance to T4A |
|---|---|---|---|
| s.2 | "data user" becomes "data controller" throughout | 1 April 2025 | Use "data controller" in the notice |
| s.3 | s.4 definitions: adds "biometric data" (and adds it to sensitive personal data); adds "personal data breach" ("any breach of personal data, loss of personal data, misuse of personal data or unauthorized access of personal data"); "requestor" now covers data portability requests; a "data subject" excludes a deceased individual | 1 April 2025 | The breach definition is broad |
| s.4 | s.5: new s.5(1A), so a data processor must comply with the Security Principle; maximum penalty for breaching the Principles raised from RM300,000 and/or 2 years to RM1,000,000 and/or 3 years | 1 April 2025 | Cloudflare, as processor, is directly bound by the Security Principle |
| s.5 | s.9 Security Principle now addresses data processors directly | 1 April 2025 | As above |
| **s.6** | **New Division 1A: s.12A (data protection officer) and s.12B (data breach notification)** | **1 June 2025** | See A4 and A5 |
| s.7 | s.16(3) Malay text: "Pendaftar" becomes "Pesuruhjaya" | 1 January 2025 | None |
| s.8 | s.21: a data controller (not only a body) may be designated a data controller forum | 1 April 2025 | None |
| **s.9** | **New s.43A: right to data portability** | **1 June 2025** | See A6 |
| s.10 | Deletes paragraph 48(e) (Functions of Commissioner) | 1 April 2025 | None |
| s.11 | s.67 (Fund bank accounts) | 1 January 2025 | None |
| s.12 | s.129: removes the Minister's whitelist; a data controller may transfer abroad where the destination has a substantially similar law or ensures adequate protection, or where a s.129(3) exception applies | 1 April 2025 | Cloudflare storage abroad; see A7 |
| s.13 | s.136: notices may be served "by way of electronic means" | 1 January 2025 | None directly |
| s.14 | Saving provision | 1 January 2025 | None |

### A4. Data protection officer (s.12A, P1 p. 23)

The statute says "A data controller shall appoint one or more data protection officers" (s.12A(1)), notified to the Commissioner (s.12A(3)). A processor processing on the controller's behalf must also appoint one (s.12A(2)).

The Commissioner's DPO Guideline (issued 25 February 2025, effective 1 June 2025) reportedly limits the mandatory appointment to controllers and processors that process personal data of **more than 20,000 data subjects**, or sensitive personal data (including financial information) of **more than 10,000 data subjects**, or whose activities require **"regular and systematic monitoring"** of personal data (S1, secondary). Law-firm summaries also report a 21-day deadline to register the DPO through the Commissioner's portal. **The official Guideline text was not retrieved; counsel must verify these figures.**

What T4A needs to know: how many sync records and push subscriptions exist in KV (`wrangler kv key list --binding SYNC` and `--binding SUBS`, counting `angle:` and `sub:` keys), and whether the "last seen" heartbeat (data inventory N2) counts as regular and systematic monitoring.

### A5. Data breach notification (s.12B, P1 p. 23)

- s.12B(1): where a data controller "has reason to believe that a personal data breach has occurred", it must "as soon as practicable, notify the Commissioner in the manner and form as determined by the Commissioner". The statute sets no harm threshold for this step.
- s.12B(2): where the breach "causes or likely to cause any significant harm to the data subject", the controller must also notify the data subject "without unnecessary delay".
- s.12B(3): failing to notify the Commissioner is an offence, with a fine of up to RM250,000 or imprisonment of up to 2 years, or both.
- The Commissioner's DBN Guideline (issued 25 February 2025) reportedly requires notification to the Commissioner within **72 hours** where a breach causes or is likely to cause significant harm or is of significant scale (**more than 1,000 data subjects**), and notification to data subjects within **7 days** of notifying the Commissioner (S1, secondary). Secondary sources disagree on whether the 72 hours runs from occurrence or discovery. **Counsel must verify against the official Guideline**, including how the Guideline's thresholds sit with the unqualified wording of s.12B(1).
- Practical problem: T4A holds no contact details for readers. The only direct channel to an affected push subscriber is a push notification; there is none at all to a sync user. The draft notice says a breach notice would go on the site.

### A6. Data portability (s.43A, P1 p. 48)

A data subject may ask the controller "to transmit his personal data to another data controller of his choice directly by giving a notice in writing by way of electronic means" (s.43A(1)), "subject to technical feasibility and compatibility of the data format" (s.43A(2)), within "the period as may be prescribed" (s.43A(3)). No regulation prescribing the period was found in this research; counsel should confirm. T4A already lets readers export their on-device data as JSON at `/progress`, which goes most of the way.

### A7. Cross-border transfer (s.129, P1 p. 89)

After A1727, a controller may transfer personal data abroad where the destination has "any law which is substantially similar to this Act" or "ensures an adequate level of protection ... at least equivalent" (s.129(2)), or where an exception in s.129(3) applies, starting with "(a) the data subject has given his consent to the transfer". Sync and push are opt-in, so the notice tells readers their data may be stored outside Malaysia at the point they opt in. Counsel should decide which s.129 limb T4A relies on.

### A8. The Notice and Choice Principle (s.7, P1 pp. 19 to 20)

s.7(1) requires a written notice telling the data subject (a) that personal data is processed, with a description; (b) the purposes; (c) any information about the source; (d) the right to request access and correction, and how to contact the controller; (e) the class of third parties it is disclosed to; (f) the choices and means for limiting processing; (g) whether supplying the data is obligatory or voluntary; and (h) if obligatory, the consequences of not supplying it.

s.7(2) requires the notice "as soon as practicable": when the data subject is first asked for data, when it is first collected, or before it is used for a new purpose or disclosed to a third party. For T4A, that means the notice (or a short link to it) should appear **at the sync and push opt-in points**, not only on a separate page.

How Part B covers s.7(1):

| s.7(1) item | Where Part B covers it |
|---|---|
| (a) processing and description | Sections 1 to 5 |
| (b) purposes | Sections 1 to 4 and 6 |
| (c) source | Section 6 ("All of it comes from your own browser") |
| (d) access, correction, contact | Sections 9 and 14 |
| (e) classes of third parties | Section 7 |
| (f) choices and means to limit | Sections 1 to 3 and 9 |
| (g) obligatory or voluntary | Section 6 |
| (h) consequences of not supplying | Section 6 |

### A9. Language (s.7(3), P1 p. 20): a Malay version is required if the Act applies

Verified text: "A notice under subsection (1) shall be in the national and English languages, and the individual shall be provided with a clear and readily accessible means to exercise his choice, where necessary, in the national and English languages." If the Act applies, the notice must be published in Bahasa Malaysia as well as English, and the opt-in and opt-out controls for sync and push should be available in both languages. The site is currently English only. A professional translation is needed; Part B has a placeholder link.

### A10. Withdrawal of consent (s.38, P1 p. 42)

"A data subject may by notice in writing withdraw his consent" (s.38(1)); the controller must then cease processing (s.38(2)); failing to do so is an offence (s.38(4): up to RM100,000 or 1 year, or both). The in-app controls (Turn off, Unlink) stop new processing. Unlink does **not** delete the server copy, so the notice offers deletion by email, and the owner needs a manual procedure for it until a delete endpoint exists.

### A11. Registration (s.14, P1 p. 24)

Only data controllers in classes specified by ministerial order must register. JPDP lists 13 classes (P4): Communication; Banking and Financial Institutions; Insurance; Health; Tourism and Hospitality; Transportation; Education; Direct Selling and Direct Marketing; Service; Real Estate; Utility; Pawnbroker; Money Lenders. JPDP describes the Communication class as licence holders under the Communications and Multimedia Act 1998 (including class and individual licences) and licensees under the Postal Services Act 2012. T4A probably falls outside all 13 unless it holds a CMA licence. Counsel should confirm.

### A12. Before this notice can be published

1. The owner fills every placeholder and confirms the Cloudflare dashboard facts flagged in `data-inventory.md` section 10.
2. The existing "Privacy and Data" section of `/disclaimer` (`src/pages/disclaimer.astro:113-117`), the Angle Code panel's "No account. No personal data. 90-day auto-delete." (`src/components/AngleCode.svelte:198`) and the push prompt's "Max 3/week" (`src/components/PushPrompt.svelte:116`) are replaced or reconciled. Today they contradict the code (`data-inventory.md` section 9).
3. Either the engineering fixes in `data-inventory.md` section 11 ship, or the `[EDITOR NOTE]` wording stays in.
4. A Bahasa Malaysia version is prepared (A9).

---

## Part B. Draft notice (reader-facing)

> Style: plain English, no em-dashes, house spelling. Text in `[EDITOR NOTE: ...]` is guidance for the owner and must be removed before publication.

# Privacy notice

Last updated: [DATE]. Version [VERSION NUMBER].
Baca dalam Bahasa Malaysia: [LINK TO MALAY VERSION]

## Who we are

The Fourth Angle ("T4A", "we", "us") is published by [OWNER LEGAL NAME] of [REGISTERED ADDRESS]. We decide how the data described here is used, so for the purposes of Malaysia's Personal Data Protection Act 2010 we are the data controller.

Questions, requests and complaints about privacy: [PRIVACY EMAIL].
[IF APPOINTED: Our data protection officer is [DPO NAME OR ROLE], reachable at [DPO EMAIL].]

## The short version

- You can read everything on T4A without an account, a name, an email address or a phone number.
- Your reading progress is saved in your own browser. It stays there unless you turn on Angle Code sync.
- Two features send data to our servers. Both stay off until you turn them on: **Angle Code sync** and **push notifications**.
- We use no analytics services, no advertising trackers and no third-party scripts. Our code sets no cookies.
- Our host, Cloudflare, receives standard technical data such as your IP address whenever your browser loads a page.

## 1. What stays on your device

T4A saves the following in your browser's own storage. We cannot see it, and it is not sent anywhere unless you turn on sync (section 2) or notifications (section 3).

| What | Why | How long |
|---|---|---|
| Which issues you have started or finished, and how many cards you have read | To mark issues as read and let you pick up where you left off | Until you clear it |
| Which cards you have highlighted | To show your highlights | Until you clear it |
| Where you last stopped reading, with the time | To offer to resume | Ignored after 24 hours; kept until replaced or cleared |
| A list of notifications you have received (up to 50) | So you can find them after dismissing them | Hidden after 30 days, then removed |
| Small settings, such as whether you closed the welcome card or the install, sync or notification prompts | So we don't show them again | Until you clear them |
| A random device label | Shown on the Reading progress page and used to name export files | Until you clear it |
| Copies of some site files | So the site loads faster and works offline | Replaced when we update the site |
| While a tab is open: flags that stop hints and animations repeating, and an animation level chosen from your device's processor and memory hints | To avoid repeating hints and to keep animations smooth | Deleted when you close the tab |

**How we use it on your device.** Once you have finished 10 issues, the app puts unread issues on the topics you read and highlight most near the top of your list. This is worked out on your device and nothing about it is sent to us. Every reader has access to the same issues.

**How to delete it.** Open the [Reading progress page](/progress) and choose **Clear**. This removes everything T4A has saved in this browser. It does not turn off notifications and does not delete a sync copy held on our server; sections 2 and 3 explain those. You can also clear this site's data in your browser settings.

[EDITOR NOTE: The "Clear all reading data" button in the Angle Code panel currently removes only the sync code, not reading data (data inventory section 8). Fix it before publishing, or do not point readers to it. Also link the Reading progress page from the site menu; nothing links to it today.]

**Taking a copy.** The Reading progress page also lets you download your progress as a file and load it into another browser. The file contains your Angle Code and, if notifications are on, your notification address (section 3). Keep it private.

## 2. Angle Code sync (optional)

**What it does.** Sync lets you continue reading on another device. When you turn it on, we give you a 6-character Angle Code. Any device that enters the code shares the same reading progress.

**What we store on our server, linked only to your code:**

- for each issue you have opened: whether you started or finished it, and how many cards you read;
- which cards you highlighted;
- where you last stopped reading, and when;
- when your progress last synced.

We do not store your name, email address or IP address with your sync record. Our sync service holds your IP address briefly in memory to stop abuse (rate limiting). It is not written to storage.

**Where it is stored.** On Cloudflare Workers KV, part of Cloudflare's global network. It may be stored outside Malaysia.

**How long we keep it.** Your sync record is deleted automatically 90 days after the last time any device linked to your code synced. Each sync restarts the 90 days.

**Who can see it.** Anyone who has your Angle Code can load your synced progress. Treat the code like a password: do not post it publicly.

**Sync links.** A sync link is a T4A web address ending in `?sync=` and a code. Opening one links that browser to the code straight away, combines its progress with the code's progress, and uploads that browser's reading progress to the code. **Only open sync links you created yourself.**

[EDITOR NOTE: The site links the browser without asking first (`src/components/App.svelte:416-418`). Adding a confirmation step is strongly recommended. Once it exists, replace the last two sentences with: "Before linking, T4A asks you to confirm."]

**Technical logs.** When a device fetches your synced progress, the code is part of the web address of that request. It may appear in our host's technical logs for up to [NUMBER] days.

[EDITOR NOTE: The owner must confirm in the Cloudflare dashboard whether Workers Logs is on for the sync service and its retention (3 or 7 days). If logs are off, delete this paragraph. Moving the code out of the web address (data inventory section 11, item 4) would also remove the need for it.]

**How to stop and delete.** Choose **Unlink** in the Angle Code panel. This device stops sending your progress, and the code is removed from this browser. The copy on our server stays until its 90 days run out. To have it deleted sooner, email [PRIVACY EMAIL] with your Angle Code. We will delete it within [NUMBER] working days and confirm by reply. We can only find your record if you give us the code.

## 3. Push notifications (optional)

**What it does.** Notifications tell you when we publish new issues. We suggest them after you finish your first issue, and you can turn them on at any time from the notification bell. Your browser asks for your permission before anything is set up.

**When we send them:**

- Tuesday and Thursday at 8am Malaysia time, if we have published new issues;
- Saturday at 9am Malaysia time, a weekly digest;
- if you have not opened T4A for 14 days, a "You Missed This" reminder at 9am Malaysia time, no more than once every 30 days.

So you may get up to four notifications in a week.

[EDITOR NOTE: The current prompt says "Max 3/week" (`src/components/PushPrompt.svelte:116`), which the code does not guarantee. Either cap sending at three a week or change the prompt. If the cap is fixed, change this paragraph to "no more than three in any week".]

**What we store on our server:**

- the notification address your browser gives us. This is a web address at your browser maker's push service (for example Google, Mozilla, Apple or Microsoft), with two keys used to encrypt messages to you;
- the date you turned notifications on;
- the last time you opened T4A with notifications on. Your browser sends us this each time you open the app, so we know whether to send a reminder;
- your browser family (for example Chrome or Safari), which we work out from the notification address;
- if we have sent you a reminder, the date we sent it.

We do not store your name, email address, IP address or reading history with your notification record.

**Who else is involved.** Your browser maker's push service delivers each notification. Messages are encrypted so the push service cannot read them. They contain only an issue headline, a short summary and a link. The push service may hold an undelivered message for up to 24 hours.

**How long we keep it.** Until you turn notifications off, or until your browser's push service tells us your notification address no longer works. We find this out when we next send a new-issue alert. The record of when we last sent you a reminder is currently kept with no end date.

[EDITOR NOTE: The reminder record (`reengaged:` key) is never deleted, even after you turn notifications off, and subscriptions have no expiry (data inventory N1, N3). Fix the code to delete the reminder record with the subscription and to expire stale subscriptions. Then replace the last sentence with a fixed period.]

**How to stop.** Open the notification bell and choose **Turn off**. This cancels the subscription in your browser and deletes your notification address from our server. If you block notifications in your browser settings instead, our record is deleted the next time a new-issue alert fails to reach you.

## 4. Security reports

Our pages tell your browser to block content from unexpected sources. If your browser blocks something on one of our pages, it may automatically send us a short report: the page address (without anything after a `?`), what was blocked and which rule blocked it, with the time. We keep these reports for 30 days to find and fix security problems. We do not store your IP address with them. Browser extensions can trigger these reports.

## 5. What our host and other services see

**Cloudflare.** Cloudflare hosts T4A and runs our sync and notification services. When your browser connects, Cloudflare receives standard technical data, including your IP address, browser type and the address of the page requested. Cloudflare processes this on our behalf as a data processor and describes its practices in its [privacy policy](https://www.cloudflare.com/privacypolicy/). [OWNER: state here whether request logs are kept and for how long.]

**No tracking.** We do not use analytics services, advertising trackers, social media plugins or third-party fonts or scripts. Our site's security settings stop pages from loading scripts from anywhere else. Our code sets no cookies.

[OWNER: confirm that no Cloudflare dashboard feature (for example bot protection) sets cookies on the site. If one does, name and explain it here.]

**Share buttons.** If you tap a share button, we open the service you chose (WhatsApp, Telegram, X, Facebook, LinkedIn or Threads) with the issue's link and text. Nothing is sent to that service unless you tap. Its own privacy policy then applies.

**Links in notifications** carry a label such as `?from=notification`. We do not currently use it for anything, but it is part of the web address your browser requests.

## 6. Why we use this data, and your consent

We use the data in this notice only to:

1. save your reading progress on your device;
2. sync your progress between devices, if you turn sync on;
3. send you notifications, if you turn them on;
4. keep our services working and secure (rate limits and security reports).

We rely on your consent for sync and notifications, which you give by turning them on. You can withdraw it at any time (section 9).

All of this data comes from your own browser. We do not obtain information about you from anyone else.

Giving us any of it is **voluntary**. If you do not turn on sync or notifications, you can still read everything on T4A. You will only miss cross-device sync and alerts.

[COUNSEL: confirm the basis for item 4, which does not depend on consent.]

## 7. Who we share data with

Only these two kinds of organisation:

- **Cloudflare**, which hosts the site and stores sync and notification records for us;
- **your browser maker's push service**, which delivers notifications, if you turn them on.

We do not sell or rent your data. We do not share it with advertisers, political parties or campaign groups. [COUNSEL: wording on disclosure where Malaysian law requires it.]

## 8. Where your data is stored

Data held on your device stays on your device. Sync and notification records are stored on Cloudflare's global network, which may be outside Malaysia. By turning on sync or notifications, you agree to that storage. [COUNSEL: confirm the s.129 basis.]

## 9. Your rights and choices

- **See your data.** On your device: download it from the [Reading progress page](/progress). On our server: email [PRIVACY EMAIL] with your Angle Code (for sync) or your notification address (shown in your downloaded file, for notifications), and we will send you what we hold.
- **Correct it.** Your progress updates as you read. If something we hold is wrong, tell us and we will correct or delete it.
- **Withdraw consent.** Turn notifications off, or unlink sync, as described in sections 2 and 3. You can also email us, and we will stop using the data and delete it.
- **Move it.** Download your progress from the Reading progress page, or ask us to send your sync record in a common file format.
- **Complain.** Contact us first at [PRIVACY EMAIL]. If you are not satisfied, you can complain to the Personal Data Protection Commissioner (Jabatan Perlindungan Data Peribadi) at https://www.pdp.gov.my.

Because we do not know who you are, we can only find data on our server if you give us your Angle Code or notification address. We will reply within [NUMBER] days.

## 10. How we protect it

All connections use HTTPS. Our security settings stop pages from loading code from other sources. Our services limit how often any one connection can make requests. Angle Codes are random 6-character codes from a 32-character set, about 1.07 billion combinations. Notification messages are encrypted. No system is perfectly secure, which is why we keep as little as possible.

## 11. If something goes wrong

If we believe personal data in our care has been lost, misused or accessed without permission, we will notify the Personal Data Protection Commissioner as the law requires. We hold no email addresses or phone numbers for readers, so we will tell affected readers through a notice on this site [and, where notifications are affected, through a notification].

## 12. Children

[COUNSEL: whether to state a minimum age, and what to say.]

## 13. Changes to this notice

If we change how we handle data, we will update this notice and the date at the top. For significant changes, we will post a notice on the site before the change takes effect.

## 14. Contact

- Privacy questions and requests: [PRIVACY EMAIL]
- General enquiries: [CONTACT EMAIL]
- Post: [OWNER LEGAL NAME], [REGISTERED ADDRESS]
- [IF APPOINTED: Data protection officer: [DPO NAME OR ROLE], [DPO EMAIL]]

This notice is published in English and Bahasa Malaysia. [COUNSEL: which version prevails if they differ.]

---

## Questions for counsel

1. **Scope.** Is T4A's processing "in respect of commercial transactions" (s.2(1), s.4)? The owner will supply how T4A is funded: no advertising today; donations, sponsorship, paid products or plans: [OWNER TO SUPPLY]. If the Act does not apply, should T4A still publish a s.7-standard notice (recommended in A2), and how should it be worded so it does not concede that the Act applies?
2. **Establishment and location.** On the owner's facts ([OWNER TO SUPPLY]: where the owner lives and whether there is a Malaysian entity), is T4A "established in Malaysia" (s.2(2) and s.2(4))? How does s.3(2) (data processed outside Malaysia) interact with storage on Cloudflare's network?
3. **Personal data.** Are (a) an Angle Code sync record, (b) a push subscription (endpoint URL and keys, last-seen time), and (c) IP addresses held briefly in worker memory "personal data" under s.4, given that identifiability is judged against information "in the possession of a data controller"? Does T4A's ability to view Cloudflare logs (which may pair an IP address with an Angle Code in a request URL) count as possession?
4. **Sensitive personal data.** Could a reading history and highlights across issues on politics, religion and royalty amount to information "as to ... political opinions [or] religious beliefs" (s.4)? If so, is turning on sync "explicit consent" under s.40(1)(a), or does the opt-in need to say so expressly?
5. **Sync links.** Opening a `?sync=CODE` link links the device and uploads its reading history to that code with no confirmation (`data-inventory.md` V4). Is consent valid in that flow? Should the site stop until a confirmation step ships?
6. **Malay version.** s.7(3) requires the notice in both national and English languages. Does it also require the in-app opt-in and opt-out controls to be bilingual now? Which version should prevail?
7. **Notice timing.** s.7(2) requires notice "as soon as practicable" at first collection. Is a short line with a link at the sync and notification prompts enough?
8. **Data protection officer.** Please verify the DPO Guideline thresholds reported in S1 (more than 20,000 data subjects; more than 10,000 for sensitive data; "regular and systematic monitoring") against the official Guideline. Does the heartbeat that records each subscriber's last visit count as regular and systematic monitoring? Does Cloudflare, as processor, have its own s.12A(2) duty here, and does T4A need anything from Cloudflare to show it?
9. **Breach notification.** s.12B(1) requires notifying the Commissioner of any breach the controller has reason to believe occurred, with no harm threshold. The Guideline reportedly adds a significant-harm or significant-scale (more than 1,000 data subjects) threshold and a 72-hour deadline. Which governs? How should T4A notify data subjects when it holds no contact details?
10. **Portability.** Is the JSON export at `/progress` plus an emailed copy of the sync record enough for s.43A? Has a period under s.43A(3) been prescribed?
11. **Cross-border transfer.** Which s.129 limb should T4A rely on for Cloudflare storage: consent at opt-in (s.129(3)(a)), adequacy (s.129(2)), or due diligence (s.129(3)(f))? Does T4A need a data processing agreement with Cloudflare, and is Cloudflare's standard customer DPA sufficient?
12. **Basis for security processing.** CSP reports and in-memory rate limiting run without consent. Which s.6(2) ground, or other basis, covers them, if the Act applies?
13. **Retention.** The push subscription has no expiry, and the reminder marker is never deleted, even after unsubscribe (`data-inventory.md` N1, N3). What retention periods satisfy the Retention Principle (s.10)? Must the reminder marker be deleted on withdrawal of consent under s.38(2)?
14. **Withdrawal and deletion.** "Unlink" stops sync but leaves the server copy for up to 90 days. Is that compatible with s.38(2) ("cease the processing") if the reader meant to withdraw consent? Is an email deletion route with [NUMBER] working days acceptable in the meantime?
15. **Registration.** Please confirm T4A does not fall in any of the 13 registrable classes. In particular, does the Communication class (CMA licence holders, including class licences) catch a content website that holds no individual licence?
16. **People named in issues.** Does s.45(2)(f) (journalistic, literary or artistic purposes) cover personal data about public figures in T4A issues and research briefs? Should the site publish a separate short statement about that processing?
17. **Existing statements.** The current `/disclaimer` says "no personally identifiable information collected", gives the 90-day sync expiry as a fixed period, promises deletion "by contacting" T4A, and does not mention push notifications. The push prompt says "Max 3/week". All differ from the code (`data-inventory.md` section 9). Do these create exposure now, and should they be corrected before this notice is ready?
18. **On-device ordering.** After 10 completed issues, the app reorders unread issues on the device from reading history. Nothing leaves the device. Does this need specific disclosure or a switch to turn it off?
19. **Controller identity.** s.7(1)(d) requires telling readers "how to contact the data controller". If the owner chooses the minimum-disclosure option in `contact-and-ownership.md` (Version B), is naming an organisation and giving a working email enough, or must the notice name the legal person who is the controller?
20. **Children.** Should T4A set and state a minimum age for sync and notifications?
21. **Access requests.** What timelines and any fees apply to access and correction requests under the Act, and should the notice state them?
