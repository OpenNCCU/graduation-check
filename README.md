A useful tool to check requirements for graduation for undergraduate students studied at National Chengchi University, Taiwan.

---

# Output

### Success Response

```json
{
  "success": true,
  "message": "",
  "data": {
    "enrollYear": 111,
    "requires": [
      {
        "type": "major",
        "deptID": "主系系所編號",
        "group": "主系組別編號",
        "year": 111,
      },
      {
        "type": "major",
        "deptID": "雙主修系所編號",
        "group": "雙主修組別編號",
        "year": 111,
      },
      {
        "type": "minor",
        "deptID": "輔系1系所編號",
        "group": "輔系1組別編號",
        "year": 111,
      },
      {
        "type": "minor",
        "deptID": "輔系2系所編號",
        "group": "輔系2組別編號",
        "year": 111,
      },
    ],
    "results": [
      {
        "require": {
          "type": "major",
          "deptID": "主系系所編號",
          "group": "主系組別編號",
          "year": 111,
        },
        "success": false,
        "messages": [
          "[註冊學期數]欠7學期",
          "[畢業總學分]欠28學分",
          "[不計學分課程名稱]因[群A]不計入畢業學分",
          "[群A]欠1門",
          "[群A]欠3學分"
        ],
        "rules": [
          {
            "uid": "",
            "description": "註冊學期數",
            "meet": false,
            "included": [],
            "excluded": [],
            "left": [],
            "detail": { "number": 1 }
          },
          {
            "uid": "",
            "description": "群A",
            "meet": false,
            "included": [ // 被此規則採計為學分的課程
              {
                "year": "111 ",
                "semester": "1",
                "regsts": "",
                "gradename": "",
                "subNum": "課程編號",
                "subName": "有學分課程名稱",
                "subSel": "修別",
                "subPnt": "3.0",
                "score": "成績",
                "over31": "N",
                "subtpe": "",
                "rem": "",
              },
              { ...credit }
            ],
            "excluded": [ // 被此規則排除採計為學分的課程
              {
                "year": "111 ",
                "semester": "1",
                "regsts": "",
                "gradename": "",
                "subNum": "課程編號",
                "subName": "不計學分課程名稱",
                "subSel": "修別",
                "subPnt": "3.0",
                "score": "成績",
                "over31": "N",
                "subtpe": "",
                "rem": "",
              },
              { ...credit }
            ],
            "left": [ // 此規則下尚未滿足需修習的科目
              {
                "name": "科目名稱",
                "minCredit": 2,
                "maxCredit": 2,
                "semesterCount": 2,
                "semester": [
                  true,
                  true,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false
                ],
                "constraint": "101",
                "note": "無"
              },
              { ...subject }
            ],
            "detail": {}
          },
          { ...rule }
        ]
      },
      { ...result }
    ]
  }
}
```

### Error Response

```json
{
    "success": false,
    "message": "",
    "data": {}
}
```
