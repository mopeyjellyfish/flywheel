# Shortlist Template

Read this file only when presenting the final shortlist or writing the saved
ideation document.

Use one stable output shape so the shortlist stays easy to review and easy to
hand off across models.

## Interactive Presentation

Present the shortlist in this order:

1. one-line framing sentence
2. `## Grounding`
3. `## Ranked Ideas`
4. `## Rejection Summary`
5. `## Recommendation`

Use this structure:

```markdown
Treating this as [repo-grounded ideation | outside-repo software ideation | universal ideation] about <topic>.

## Grounding

- <short context point>
- <short context point>

## Ranked Ideas

### 1. <Idea Title>
- Why it matters now: <one line>
- Why it survives: <one line>
- Downsides: <one line>
- Confidence: <0-100%>
- Complexity: <Low | Medium | High>
- Next step: `/fw:brainstorm` | `stay in ideation` | `save for later`

### 2. <Idea Title>
...

## Rejection Summary

| Idea | Reason Rejected |
|------|-----------------|
| <Idea> | <Reason> |

## Recommendation

- Best next move: <one line>
- Why: <one line>
```

## Saved Document Shape

When writing `docs/ideation/`, keep the same field order and wording stable so
later planning and review can read it predictably.

The saved doc may be slightly fuller than the interactive shortlist, but it
should not change the section order or field names established above.
