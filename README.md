# MusaLCEClientForVSCode

**Visual Studio Code extension that acts as a REPL client for any [Musa-DSL](https://github.com/javier-sy/musa-dsl) live coding session.**

Send selected code (or the current line) from VSCode to a running `Musa::REPL` server over TCP, watch the server's responses and errors stream into a side panel. The extension is REPL-agnostic — it works with any server that speaks the Musa REPL line protocol on `localhost:1327`.

## Two ways to use it

### 1) Standalone — bring your own REPL

You build your own `main.rb` (sequencer, voices, clock, transport, scale) and start the REPL yourself inside the sequencer's DSL context:

```ruby
require 'musa-dsl'
require 'midi-communications'

include Musa::All

output = MIDICommunications::Output.gets
clock = Musa::Clock::TimerClock.new(bpm: 120, ticks_per_beat: 24)
transport = Musa::Transport::Transport.new(clock, 4, 24)
voices = Musa::MIDIVoices.new(sequencer: transport.sequencer, output: output, channels: [0])

transport.sequencer.with do
  # ... define helpers, scales, patterns ...

  Musa::REPL::REPL.new(binding)   # opens TCP/1327 in this DSL context
end

transport.start
```

Run `ruby main.rb`, then connect from VSCode. Maximum control; you wire MIDI, voices, clock and any custom DSL helpers yourself. See [`musadsl-demo/_demo-13-live-coding`](https://github.com/javier-sy/musadsl-demo) for a complete worked example (Tidal-Cycles-style `d(n)`, `hush`, `solo` API).

### 2) Via musalce-server — the suite handles REPL + DAW

Install and run the [musalce-server](https://github.com/javier-sy/musalce-server) gem:

```bash
gem install musalce-server
musalce-server bitwig    # or: musalce-server live
```

The server boots the REPL, the sequencer, the DAW handler and exposes `daw.*` (e.g. `daw.tracks`, `daw.transport`, `daw.surface`) in the DSL context for you. Requires the matching DAW-side extension running:

- [MusaLCEforBitwig](https://github.com/javier-sy/MusaLCEforBitwig) for Bitwig Studio
- [MusaLCEforLive](https://github.com/javier-sy/MusaLCEforLive) for Ableton Live

See the [musalce-server README](https://github.com/javier-sy/musalce-server#readme) for the full Quick Start and the `daw.*` REPL commands reference.

### Which one should I use?

| Use case 1 (standalone) | Use case 2 (suite) |
|---|---|
| You want full control over MIDI/clock/voices | You want the DAW connection ready out of the box |
| You're driving SuperCollider, Max/MSP, OSC apps, the `say` voice, etc. | You're driving Bitwig or Live |
| You're prototyping a personal live-coding DSL | You want a Stream Deck wired into your score via Pulso's MusaLCE Surface integration (Bitwig only today) |

Both workflows use the same VSCode extension. The extension does not know or care which server is on the other end.

## Install

### From the VSCode Marketplace (recommended)

The extension is published as [`javier-sy.musa-lce-client-for-vscode`](https://marketplace.visualstudio.com/items?itemName=javier-sy.musa-lce-client-for-vscode). Install in one line:

```bash
code --install-extension javier-sy.musa-lce-client-for-vscode
```

Or search for *"Musa-DSL Live Coding"* in the Extensions sidebar inside VSCode.

### From source (for development)

If you're hacking on the extension itself or want to install an unreleased build:

```bash
cd MusaLCEClientForVSCode
npm install
npm run compile
npx @vscode/vsce package       # produces musa-lce-client-for-vscode-<version>.vsix
code --install-extension musa-lce-client-for-vscode-*.vsix
```

Or open the project in VSCode and press **F5** to launch an Extension Development Host with the extension loaded from the current source.

## Keybindings

| Shortcut | Command | What it does |
|---|---|---|
| `Ctrl+Alt+Enter` | `MusaLCE: send` | Sends the current selection to the server. If nothing is selected, sends the current line. |
| `Ctrl+Alt+M` | `MusaLCE: toggle results` | Shows / hides the MusaLCE status panel. |

Both commands are also available in the command palette, the editor context menu and the editor title bar.

## Status panel

The status panel renders the server's responses live as the sequencer executes. It distinguishes four kinds of message coming back from the server, following the line protocol documented in [`musa-dsl/docs/subsystems/repl.md`](https://github.com/javier-sy/musa-dsl/blob/master/docs/subsystems/repl.md):

- `//echo … //end` — code about to be executed, echoed back so you can confirm what landed.
- Plain lines (anything not prefixed with `//`) — Ruby `puts` output, sequencer log lines, return values.
- `//error … //backtrace … //end` — raised exceptions with backtrace.
- Future responses from work that develops in time (events scheduled with `at`, `every`, `play`, etc.) keep arriving as the sequencer runs.

## Configuration

The extension connects to `localhost:1327` by default. **There is currently no VSCode setting to change the host or port** — the connection target is fixed in `src/connection.ts` (lines 13-15). If you need to connect to a remote or non-default server, edit those defaults and rebuild, or pass `host` / `port` to the `Connection` constructor in `src/extension.ts`.

This will likely be exposed as a proper VSCode setting in a future release.

## Internal commands

Selections beginning with `#%` are treated as **internal extension commands** rather than Ruby code: they are `eval`-ed against the extension's `commands` object and never reach the server. These are intended for advanced/diagnostic use and are not part of the user-facing API. Avoid lines starting with `#%` in production scores.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Status panel shows *"Error on connection … (Error: connect ECONNREFUSED)"* | No `Musa::REPL` server is running on `localhost:1327`. Start one (either case 1 or case 2 above) and use *MusaLCE: toggle results* twice to reconnect. |
| Status panel shows code echoes but no output | The server is connected, but the Ruby code has no `puts` and no return value worth displaying. Add `puts something` to verify. |
| Need to point at a non-default host/port | See *Configuration* above — currently requires editing `connection.ts`. |

## Author

[Javier Sánchez Yeste](https://github.com/javier-sy)

## License

[MusaLCEClientForVSCode](https://github.com/javier-sy/MusaLCEClientForVSCode) Copyright (c) 2021-2026 [Javier Sánchez Yeste](https://yeste.studio), licensed under GPL 3.0 License.
