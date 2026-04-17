import json, re

NEW_CARDS = [
  {
    "id": 9,
    "trigger": "Teenage boy + unilateral nosebleed + nasal mass",
    "icon": "🚨",
    "action": "JNA — DO NOT BIOPSY",
    "rows": [
      {"see": "Teenage boy + unilateral epistaxis + mass", "do": "STOP. No biopsy, no pack. CT/MRI first.", "urgent": True},
      {"see": "Bleeding not controlled with anterior pack", "do": "Urgent ENT. May need embolisation.", "urgent": True},
      {"see": "Mass on imaging", "do": "Refer to ENT/skull base. Surgical planning.", "urgent": False}
    ],
    "traps": ["Blind biopsy = catastrophic haemorrhage", "Anterior packing alone = inadequate, may worsen bleeding"]
  },
  {
    "id": 10,
    "trigger": "Adult + sudden hearing loss >=30 dB within 72 hours",
    "icon": "🚨",
    "action": "SSNHL — Cochlear Emergency",
    "rows": [
      {"see": "Sudden unilateral hearing loss (<72 hrs)", "do": "Same-day ENT. Start prednisolone 60mg immediately.", "urgent": True},
      {"see": "SSNHL + vertigo", "do": "Worse prognosis. Admit. IV steroids.", "urgent": True},
      {"see": "SSNHL in anticoagulated patient", "do": "ENT + haematology same day.", "urgent": True}
    ],
    "traps": ["Every day of delay worsens prognosis", "Wait and see = negligent in SSNHL"]
  },
  {
    "id": 11,
    "trigger": "Adult + unilateral OME (glue ear)",
    "icon": "🚨",
    "action": "Unilateral OME — Exclude NPC",
    "rows": [
      {"see": "Adult + unilateral OME on otoscopy", "do": "NPC until proven otherwise. Urgent nasopharyngoscopy.", "urgent": True},
      {"see": "Unilateral OME + neck mass", "do": "2-WEEK CANCER REFERRAL. NPC with nodal spread.", "urgent": True},
      {"see": "Child + bilateral OME >3 months", "do": "Audiogram. If >=25 dBHL then grommets referral.", "urgent": False}
    ],
    "traps": ["Do NOT insert grommet in adult unilateral OME without nasopharyngoscopy first"]
  },
  {
    "id": 12,
    "trigger": "Child + speech delay",
    "icon": "👁",
    "action": "Speech Delay — Hearing Test First",
    "rows": [
      {"see": "Child + delayed speech milestones", "do": "Hearing test FIRST before speech therapy referral.", "urgent": False},
      {"see": "Hearing loss confirmed on audiogram", "do": "Grommets if OME. Hearing aid if SNHL. ENT.", "urgent": False},
      {"see": "Child + OSA signs + snoring", "do": "T&A before ADHD/speech label.", "urgent": False}
    ],
    "traps": ["Missing hearing loss is the commonest cause of missed speech delay", "Do not refer to SALT before audiology"]
  },
  {
    "id": 13,
    "trigger": "Hoarseness >3 weeks in any adult",
    "icon": "🚨",
    "action": "Hoarseness >3 Weeks — Urgent Laryngoscopy",
    "rows": [
      {"see": "Hoarseness >3 weeks, any adult", "do": "URGENT laryngoscopy. No exceptions. No treat-and-wait.", "urgent": True},
      {"see": "Hoarseness >3 weeks + smoker", "do": "2-WEEK CANCER REFERRAL. Laryngeal cancer until proven otherwise.", "urgent": True},
      {"see": "Hoarseness + weight loss + neck mass", "do": "Same-day 2-week referral. CT neck/chest.", "urgent": True},
      {"see": "Hoarseness <3 weeks, no red flags", "do": "Reassure. Voice rest. Review in 3 weeks.", "urgent": False}
    ],
    "traps": ["Rule = 3 weeks NOT 6 weeks", "Unilateral VCP with no cause: CT chest urgently"]
  },
  {
    "id": 14,
    "trigger": "Unilateral nasal obstruction in adult",
    "icon": "🚨",
    "action": "Unilateral Nasal — Exclude Tumour",
    "rows": [
      {"see": "Adult + unilateral nasal obstruction", "do": "Tumour until imaging proves otherwise. 2-week referral.", "urgent": True},
      {"see": "Unilateral + bloody discharge + adult", "do": "2-WEEK CANCER REFERRAL. Not sinusitis.", "urgent": True},
      {"see": "Unilateral + anosmia + epistaxis", "do": "MRI sinuses + 2-week ENT referral.", "urgent": True}
    ],
    "traps": ["Unilateral is not deviated septum by default", "It looks like sinusitis = dangerous assumption"]
  },
  {
    "id": 15,
    "trigger": "Facial nerve palsy + ear signs",
    "icon": "🚨",
    "action": "Facial Palsy — Exclude Cholesteatoma",
    "rows": [
      {"see": "Facial palsy + smelly ear discharge", "do": "Cholesteatoma eroding CN VII. SAME-DAY ENT. Emergency.", "urgent": True},
      {"see": "Facial palsy + vesicles in ear canal", "do": "Ramsay Hunt. Aciclovir + prednisolone within 72 hrs.", "urgent": True},
      {"see": "Facial palsy, no ear signs, no cause", "do": "Bell palsy. Prednisolone 50mg x 10 days.", "urgent": False}
    ],
    "traps": ["Cholesteatoma palsy = surgical emergency not Bell palsy", "Ramsay Hunt vesicles may appear AFTER palsy"]
  },
  {
    "id": 16,
    "trigger": "Neck mass in adult >40 present >3 weeks",
    "icon": "🚨",
    "action": "Neck Mass — Rule of 80s",
    "rows": [
      {"see": "Adult >40 + lateral neck mass >3 weeks", "do": "2-WEEK CANCER REFERRAL. Rule of 80s = 80% malignant.", "urgent": True},
      {"see": "Neck mass + dysphagia + weight loss", "do": "Examine oral cavity + oropharynx. 2-week referral.", "urgent": True},
      {"see": "Neck mass + floor of mouth ulcer", "do": "SCC until proven otherwise. Same-day referral.", "urgent": True},
      {"see": "Child + lateral neck mass anterior to SCM", "do": "Branchial cyst. Refer. Do NOT incise.", "urgent": False}
    ],
    "traps": ["NEVER incise lateral neck mass without tissue diagnosis", "Examine primary site BEFORE FNA"]
  },
  {
    "id": 17,
    "trigger": "Unilateral tonsil enlargement",
    "icon": "🚨",
    "action": "Unilateral Tonsil — Exclude Lymphoma",
    "rows": [
      {"see": "Unilateral tonsil enlargement painless", "do": "Lymphoma until proven otherwise. 2-week referral.", "urgent": True},
      {"see": "Unilateral + trismus + uvular deviation + fever", "do": "Quinsy. IV antibiotics + drainage. ENT.", "urgent": True},
      {"see": "Post-tonsillectomy any bleeding", "do": "EMERGENCY DEPARTMENT immediately.", "urgent": True}
    ],
    "traps": ["Painless unilateral tonsil enlargement is not chronic tonsillitis", "Quinsy: uvula deviates AWAY from abscess"]
  }
]

c = open("data.js").read()
i = c.index('"action_cards":[')
k = i + len('"action_cards":[')
depth = 1
j = k
while j < len(c) and depth > 0:
    if c[j] == '[':
        depth += 1
    elif c[j] == ']':
        depth -= 1
    j += 1
j -= 1
new_json = ", ".join(json.dumps(card, ensure_ascii=False) for card in NEW_CARDS)
c = c[:j] + ", " + new_json + c[j:]
open("data.js", "w").write(c)
print("Added", len(NEW_CARDS), "cards. Total:", c.count('"trigger"'))
