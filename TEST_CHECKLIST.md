Test Run Checklist
Use this checklist to verify DikachiVideo AI Studio is fully functional after installation.
Environment Setup
[ ] Python 3.10+ installed (python --version)
[ ] Node.js 18+ installed (node --version)
[ ] FFmpeg 5.0+ installed (ffmpeg -version)
[ ] Backend virtual environment created
[ ] Backend dependencies installed (pip install -r requirements.txt)
[ ] Frontend dependencies installed (npm install)
[ ] .env file configured from .env.example
[ ] Database initialized
Startup
[ ] ./start.sh (macOS/Linux) or start.bat (Windows) runs without errors
[ ] Backend starts on http://localhost:8000
[ ] Frontend starts on http://localhost:3000
[ ] API docs accessible at http://localhost:8000/docs
[ ] No port conflicts
Dashboard
[ ] Dashboard loads at http://localhost:3000
[ ] Health check widget shows system status
[ ] Engine status indicator shows available engines
[ ] "New Project" button opens create modal
[ ] Create project form validates inputs
[ ] Project appears in dashboard after creation
[ ] Project card shows correct status badge
[ ] Search filters projects correctly
[ ] Grid/List view toggle works
[ ] Delete project opens confirmation modal
[ ] Delete confirmation requires project name
[ ] Project removed after deletion
[ ] Empty state shows when no projects
Studio — Workflow Steps
Step 1: Prompt
[ ] Studio page loads for existing project
[ ] Prompt input displays existing prompt
[ ] "Generate Script" button works
[ ] Loading state shown during generation
[ ] Generated script displays correctly
[ ] "Regenerate Script" works
[ ] Script is collapsible/expandable
[ ] Toast notification on success/error
Step 2: Scenes
[ ] Scenes generated automatically after script
[ ] Scene cards show order, description, duration
[ ] Expand/collapse scene details
[ ] Edit scene description inline
[ ] Edit scene duration inline
[ ] Edit scene script text inline
[ ] Delete scene works
[ ] "Generate All" videos button works
Step 3: Video Generation
[ ] Per-scene video generation works
[ ] Batch "Generate All" works
[ ] Progress shown (completed/total)
[ ] Video preview plays in panel
[ ] Generated videos persist on refresh
Step 4: Voice
[ ] Voice selector shows all available voices
[ ] "Generate Voiceover" works
[ ] Audio player plays generated voice
[ ] Warning shown if no script exists
Step 5: Subtitles
[ ] Subtitle style selector works (6 styles)
[ ] Live preview of selected style
[ ] "Generate Subtitles" works
[ ] Success indicator after generation
[ ] Warning shown if no script exists
Step 6: Music
[ ] Music prompt input works
[ ] Preset buttons populate prompt
[ ] "Generate Music" works
[ ] Audio player plays generated music
Step 7: Thumbnail
[ ] AI Generate tab works
[ ] Extract Frame tab works
[ ] Preset buttons populate prompt
[ ] Generated thumbnail displays
[ ] Download thumbnail works
[ ] Regenerate thumbnail works
Step 8: Assemble
[ ] "Assemble Video" button works
[ ] Error shown if no scene videos
[ ] Loading state during assembly
[ ] Success toast on completion
[ ] Preview window shows assembled video
Step 9: Export
[ ] "Export MP4" button works
[ ] Error shown if no assembled video
[ ] Loading state during export
[ ] Success toast on completion
[ ] Download works from preview window
Settings
[ ] Settings page loads at /settings
[ ] API Keys tab works
[ ] OpenAI key saves correctly
[ ] ElevenLabs key saves correctly
[ ] Output tab works
[ ] Resolution selector works
[ ] Voice tab works
[ ] Default voice selector works
[ ] Settings persist after refresh
UI Components
[ ] Button variants render correctly (default, secondary, ghost, outline, destructive)
[ ] Button loading state works
[ ] Card component renders correctly
[ ] Modal opens/closes with animation
[ ] Toast notifications appear on actions
[ ] Toast auto-dismisses after 5 seconds
[ ] Skeleton loaders show during loading
[ ] Badge variants render correctly
[ ] Select dropdown works
[ ] Tabs switch content correctly
Responsive Design
[ ] Dashboard works on mobile (320px+)
[ ] Studio works on mobile
[ ] Settings works on mobile
[ ] Sidebar collapses to hamburger menu
[ ] Grid layout switches to single column
[ ] Touch targets are adequate size
Error Handling
[ ] 404 page shows for invalid project ID
[ ] Network errors show toast notifications
[ ] Form validation prevents invalid submissions
[ ] API errors display user-friendly messages
[ ] Loading states prevent duplicate submissions
Performance
[ ] Dashboard loads in < 2 seconds
[ ] Studio loads in < 2 seconds
[ ] No memory leaks during navigation
[ ] Video previews load efficiently
[ ] No console errors
Final Verification
[ ] Complete end-to-end: Create → Script → Scenes → Videos → Voice → Subtitles → Music → Thumbnail → Assemble → Export
[ ] All generated files saved to output directory
[ ] Application runs without crashes for 30+ minutes
[ ] All Phase 2, 3, and 4 files present in correct locations