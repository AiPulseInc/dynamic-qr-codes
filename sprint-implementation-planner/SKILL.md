---
name: sprint-implementation-planner
description: Build detailed, incremental implementation plans split into logical sprints with clear goals, scoped tasks, measurable success criteria, and comprehensive test batches per sprint. Use when a user asks for project planning in phases, wants each sprint to be independently verifiable, or requests creation and ongoing updates of a `test-result.md` file after each sprint.
---

# Sprint Implementation Planner

Create a plan that can be executed sprint-by-sprint without rework.
Make each sprint independently testable and reviewable.

## Workflow

1. Confirm planning inputs.
- Capture target outcome, current project state, constraints, timeline, team size, and required stack.
- If key details are missing, state assumptions explicitly and continue.

2. Define sprint boundaries.
- Split work into logical increments where each sprint leaves the project in a working state.
- Ensure each sprint has clear dependency flow from previous sprints.
- Avoid mixing foundational setup and advanced features in the same sprint.

3. Design each sprint with fixed sections.
- Use this section order for every sprint:
  1. Goal
  2. Scope
  3. Tasks
  4. Success definition
  5. Test batch
  6. Deliverables

4. Enforce implementation quality.
- Tasks must be concrete and actionable (not vague statements).
- Success definition must be measurable and binary (pass/fail ready).
- Test batch must include at least:
  - Unit tests
  - Integration tests
  - End-to-end or workflow tests
  - Regression checks
  - Non-functional checks relevant to the project (performance, security, accessibility, reliability)

5. Create and maintain `test-result.md`.
- If `test-result.md` does not exist, create it using `references/test-results-template.md`.
- After each sprint, append or update:
  - Sprint identifier and date
  - Executed test list
  - Pass/fail status
  - Known issues and blockers
  - Fix status and retest outcome
- Keep entries chronological and concise.

## Output Requirements

Always produce these sections in this order:

1. Project assumptions
2. Sprint roadmap summary
3. Sprint breakdowns (detailed)
4. `test-result.md` update plan
5. Risks and mitigation

## Sprint Template

Use this exact structure for each sprint:

```markdown
### Sprint N: <Name>
Goal:
<single outcome statement>

Scope:
- <in scope item>
- <in scope item>

Tasks:
- [ ] <task 1>
- [ ] <task 2>

Success definition:
- <measurable condition>
- <measurable condition>

Test batch:
- Unit: <test cases and expected result>
- Integration: <test cases and expected result>
- E2E: <test cases and expected result>
- Regression: <test cases and expected result>
- Non-functional: <test cases and expected result>

Deliverables:
- <artifact, endpoint, UI module, or document>
```

## Quality Rules

- Keep sprint size realistic for one iteration window.
- Prioritize highest-risk foundations early.
- Ensure later sprints reuse and extend previous sprint outputs.
- Do not define tasks that cannot be verified by tests.
- Reject ambiguous wording like "improve", "optimize", or "handle" without measurable criteria.

## References

- `references/test-results-template.md`: Canonical format for `test-result.md`.
