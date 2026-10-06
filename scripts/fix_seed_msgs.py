from pathlib import Path
p = Path("src/lib/seed.ts")
t = p.read_text()
# Ensure ChatMessage import
if "ChatMessage" not in t.split("from \"./types\"")[0]:
    t = t.replace(
        "  ChatStart,\n  StoreData,",
        "  ChatStart,\n  ChatMessage,\n  StoreData,",
    )
old = """    const msgs = [
      {
        id: `msg_${lead.id}_1`,
        role: "assistant" as const,
        content: `Hi, I'm Alex with Quelliv. I can take a request for access or answer a general question about the company.`,
        createdAt: lead.createdAt,
      },
    ];"""
new = """    const msgs: ChatMessage[] = [
      {
        id: `msg_${lead.id}_1`,
        role: "assistant",
        content: `Hi, I'm Alex with Quelliv. I can take a request for access or answer a general question about the company.`,
        createdAt: lead.createdAt,
      },
    ];"""
if old not in t:
    raise SystemExit("msgs block not found")
t = t.replace(old, new, 1)
# Remove unnecessary `as const` on subsequent role fields in that loop for cleanliness
t = t.replace('role: "user" as const,', 'role: "user",')
t = t.replace('role: "assistant" as const,', 'role: "assistant",')
t = t.replace(
    'role: m % 2 === 0 ? ("user" as const) : ("assistant" as const),',
    'role: m % 2 === 0 ? "user" : "assistant",',
)
p.write_text(t)
print("fixed")
