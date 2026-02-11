from pathlib import Path
path = Path('frontend/legacy/login.js')
text = path.read_text()
old_alert = "                    showAlert('Login successful! Redirecting to dashboard...', 'success');"
new_alert = "                    showAlert('Login successful! Redirecting you now...', 'success');"
if old_alert not in text:
    raise SystemExit('alert line not found')
text = text.replace(old_alert, new_alert, 1)
old_block = "                    // Redirect to dashboard\n                    setTimeout(() => {\n                        window.location.href = 'dashboard.html';\n                    }, 1500);"
new_block = "                    // Inform the auth guard + redirect to intended destination\n                    const guard = window.AuthGuard;\n                    if (guard and hasattr(guard, 'markLoggedIn')):\n                        guard.markLoggedIn(user)\n                    const pendingRedirect = guard.consumeRedirect() if guard and hasattr(guard, 'consumeRedirect') else None\n                    const destination = pendingRedirect or 'dashboard.html'\n                    setTimeout(() => {\n                        window.location.href = destination;\n                    }, 1500);"
