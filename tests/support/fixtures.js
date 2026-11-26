// Made-up sample data in the shape of the real Realtime Database.
// No real patients or caregivers appear here.
// Note: "aricles" (sic) is the real database path, so the typo stays.

const avatar = "images/sample-avatar.svg";

export const sampleData = {
  aricles: {
    a1: {
      title: "Sample article: recognising stroke with F.A.S.T.",
      author: "Karing team",
      content: "Face drooping, Arm weakness, Speech difficulty, Time to call emergency services.",
      image: "images/article1.png",
    },
    a2: {
      title: "Sample article: caring for a patient at home",
      author: "Karing team",
      content: "Short sample body text.",
      image: "images/article2.png",
    },
    noimage: { title: "Sample article without an image", author: "Karing team", content: "Body." },
  },
  db: {
    pt: {
      p1: { name: "Nguyễn Văn A", place: "Hà Nội", age: 70, sex: "Nam", image: avatar },
      p2: { name: "Trần Thị B", place: "Bắc Ninh", age: 65, sex: "Nữ", image: avatar },
    },
  },
};

// Hostile record used to prove database text is rendered as text, not HTML.
export const xssData = {
  aricles: {
    evil: {
      title: '<img src=x onerror="window.__pwned=1">',
      author: "<b>x</b>",
      content: '<script>window.__pwned=1</script>',
      image: 'x" onerror="window.__pwned=1',
    },
  },
  db: {
    pt: {
      evil: { name: '<img src=x onerror="window.__pwned=1">', place: "<i>x</i>", age: 1, sex: "Nam", image: avatar },
    },
  },
};
