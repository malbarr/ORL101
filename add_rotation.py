import json

ROTATION = [
  {
    "id": 1,
    "title": "How to Present a Case",
    "icon": "🎤",
    "items": [
      {
        "subtitle": "In Rounds (Ward Round)",
        "content": "1. 'This is [Name], [Age]y, [M/F], Day [X] of admission.'\n2. Presenting complaint in one sentence.\n3. Relevant history: duration, severity, associated symptoms.\n4. Key examination findings (positive + relevant negatives).\n5. Investigations: relevant results only.\n6. Assessment: 'My impression is...'\n7. Plan: 'We plan to...'\n\nTip: Under 2 minutes. Lead with diagnosis, not the story."
      },
      {
        "subtitle": "In Clinic",
        "content": "1. 'New/Follow-up — [Name], [Age]y.'\n2. Chief complaint + duration.\n3. Relevant history (surgical/medical/medications).\n4. ENT-focused examination findings.\n5. Impression + differential.\n6. Proposed management.\n\nTip: One sentence per section."
      },
      {
        "subtitle": "In Theatre",
        "content": "Pre-op: 'Patient is [Name], [Age]y, for [procedure] under [GA/LA]. Consented. NBM since [time]. Site marked. Allergies: [none/X].'\n\nPost-op: 'Procedure: [X]. Findings: [Y]. Haemostasis achieved. Blood loss: [estimate]. Patient stable. Plan: [analgesia/antibiotics/follow-up].'"
      },
      {
        "subtitle": "Sign-out / Handover (SBAR)",
        "content": "S — Situation: 'Patient [Name], [Age]y, admitted for [reason].'\nB — Background: Key history, diagnosis, procedures done.\nA — Assessment: Current status, concerns.\nR — Recommendation: What the next team needs to do.\n\nAlways mention: active medications, pending results, escalation plan."
      }
    ]
  },
  {
    "id": 2,
    "title": "How to Write",
    "icon": "✍️",
    "items": [
      {
        "subtitle": "Progress Notes (SOAP)",
        "content": "Date / Time / Name + grade\n\nS — Subjective: What the patient reports today.\nO — Objective: Vitals, examination, new results.\nA — Assessment: Current impression.\nP — Plan: Medications, investigations, referrals, follow-up.\n\nSign: Name, role, contact."
      },
      {
        "subtitle": "Consultation Request",
        "content": "To: Dr. [Name] — [Specialty]\nFrom: Dr. [Name] — ENT | Date: [__]\n\nRe: [Patient], [Age]y, MRN: [__] | Ward: [__]\n\nReason: [One clear sentence]\n\nHistory: [2-3 sentences]\n\nExamination: [Relevant findings]\n\nDiagnosis: [Your impression]\n\nRequest: [Specific question]\n\nDr. [Name] | Ext: [__]"
      },
      {
        "subtitle": "Referral Letter",
        "content": "Date: [__]\n\nTo: Dr. [________] — [________] Department\nRe: [Patient Name], [Age]y, [M/F]\n\nDear Dr. [__],\n\nI am referring this patient for your assessment.\n\nReason: [_______]\nHistory: [_______]\nExamination: [_______]\nDiagnosis: [_______]\nRequest: [_______]\n\nYours sincerely,\nDr. Mohammad H. Al-Bar\nConsultant ENT — KFHU / Al-Habib"
      },
      {
        "subtitle": "Operative Notes",
        "content": "Date: [__] | Start: [__] | End: [__]\nSurgeon: [__] | Assistant: [__] | Anaesthesia: GA/LA\n\nProcedure: [Full name]\nDiagnosis: Pre-op [__] → Post-op [__]\n\nFindings: [_______]\n\nProcedure:\n1. Patient positioned [__].\n2. [Steps — concise].\n3. Haemostasis achieved.\n4. Closure: [sutures/packing/none].\n\nSpecimen: [Sent/NA] | Blood loss: [__ml]\nComplications: None / [__]\nPost-op plan: [__]"
      },
      {
        "subtitle": "Medical Report",
        "content": "MEDICAL REPORT\nDate: [__]\nPrepared by: Dr. Mohammad H. Al-Bar, Consultant ENT\nFor: [insurance/legal/employer]\n\nPatient: [Name] | DOB: [__] | MRN: [__] | ID: [__]\n\nDiagnosis: [__]\nTreatment: [__]\nCurrent status: [Stable/ongoing/discharged]\nFitness: [Fit/Unfit until [date]]\n\nSignature: ____________ | Stamp: ____________"
      },
      {
        "subtitle": "Investigation Request",
        "content": "Patient: [Name] | MRN: [__] | Date: [__]\nRequesting doctor: [__]\n\nRequested:\n[ ] CT [region] with/without contrast\n[ ] MRI [region]\n[ ] Audiogram / Tympanometry\n[ ] Nasoendoscopy\n[ ] Blood tests: [__]\n[ ] Other: [__]\n\nIndication: [One sentence]\nUrgency: [ ] Routine  [ ] Urgent  [ ] Emergency"
      }
    ]
  },
  {
    "id": 3,
    "title": "Templates (Copy-Paste Ready)",
    "icon": "📋",
    "items": [
      {
        "subtitle": "ENT Referral Letter",
        "content": "To: Dr. [________] — [________] Department\nRe: [________], [__] years, [M/F]\n\nReason for referral:\nPatient presents with [________] for [___] days/weeks.\n\nRelevant history: [________]\n\nExamination findings: [________]\n\nWorking diagnosis: [________]\n\nRequest: [________]\n\nThank you.\nDr. Al-Bar — ENT"
      },
      {
        "subtitle": "Consent Briefing",
        "content": "Procedure: [__]\n\nI have explained:\n1. Nature of the procedure\n2. Indication and expected benefit\n3. Risks: general (bleeding, infection) and specific ([__])\n4. Alternatives: [__]\n5. Right to withdraw\n\nPatient signature: ____________\nDoctor: ____________ | Date: [__]"
      },
      {
        "subtitle": "Discharge Summary",
        "content": "Patient: [Name] | MRN: [__]\nAdmission: [date] | Discharge: [date]\nConsultant: Dr. Al-Bar\n\nAdmitting diagnosis: [__]\nDischarge diagnosis: [__]\nProcedures: [__]\n\nCourse: [3-4 sentences]\n\nDischarge medications:\n1. [Drug] [dose] [frequency] [duration]\n\nFollow-up: ENT clinic in [__] weeks\nReturn if: [red flags]\n\nSigned: Dr. [__]"
      },
      {
        "subtitle": "Sick Leave Certificate",
        "content": "MEDICAL CERTIFICATE\n\nThis certifies that:\n[Full Name] | ID: [__] | DOB: [__]\n\nIs under my care for [condition].\n\nUnfit for work/study from [date] to [date].\nTotal: [__] days.\n\nDr. Mohammad H. Al-Bar\nConsultant ENT — KFHU\nDate: [__] | Stamp: ____________"
      }
    ]
  }
]

c = open("data.js").read()

if '"rotation"' not in c:
    new_data = json.dumps(ROTATION, ensure_ascii=False)
    insert_str = f',\n  "rotation": {new_data}'
    pos = c.rfind('};')
    if pos == -1:
        pos = c.rfind('}')
    c = c[:pos] + insert_str + '\n' + c[pos:]
    open("data.js", "w").write(c)
    print("Added rotation:", len(ROTATION), "sections")
else:
    print("Already exists")
