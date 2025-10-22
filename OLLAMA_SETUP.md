# Ollama Integration Setup Guide

This guide explains how to set up and use Ollama (local LLM) with your resume matching application.

## What is Ollama?

Ollama is a tool that allows you to run Large Language Models (LLMs) **locally on your machine** without needing API keys or internet connection. This means:

- ✅ **No API costs** - Run models for free
- ✅ **Privacy** - Your data never leaves your machine
- ✅ **No rate limits** - Use as much as you want
- ✅ **Works offline** - No internet required after setup

## Step 1: Install Ollama

### On macOS:
```bash
brew install ollama
```

Or download from: https://ollama.ai/download

### On Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### On Windows:
Download the installer from: https://ollama.ai/download

## Step 2: Start Ollama Service

```bash
ollama serve
```

This starts the Ollama server on `http://localhost:11434`

**Note:** Keep this terminal window open while using the application.

## Step 3: Download a Model

Open a **new terminal** and download a model. Recommended models:

### Llama 3.2 (3B) - Fast, Good Quality ⭐ Recommended
```bash
ollama pull llama3.2
```
- Size: ~2GB
- Speed: Very fast
- Quality: Excellent for most tasks

### Llama 3.2 (1B) - Fastest, Smaller
```bash
ollama pull llama3.2:1b
```
- Size: ~1GB
- Speed: Extremely fast
- Quality: Good for simple tasks

### Mistral (7B) - Balanced
```bash
ollama pull mistral
```
- Size: ~4GB
- Speed: Medium
- Quality: Very good

### Llama 3.1 (8B) - Best Quality
```bash
ollama pull llama3.1
```
- Size: ~4.7GB
- Speed: Slower
- Quality: Excellent

## Step 4: Configure Environment Variables

Create a file named `.env.local` in your project root:

```bash
# Enable Ollama integration
USE_OLLAMA=true

# Ollama server host (default: http://localhost:11434)
OLLAMA_HOST=http://localhost:11434

# Model to use (default: llama3.2)
OLLAMA_MODEL=llama3.2
```

### Available Models to Set:
- `llama3.2` (recommended)
- `llama3.2:1b` (fastest)
- `llama3.1`
- `mistral`
- `mixtral`
- `codellama`
- `qwen2.5`

## Step 5: Test Your Setup

### Verify Ollama is Running:
```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response listing your downloaded models.

### Test the Model:
```bash
ollama run llama3.2 "Hello, can you help me?"
```

## Step 6: Start Your Application

```bash
npm run dev
```

Now when you click "Start Matching", the app will use Ollama to analyze candidates!

## Troubleshooting

### Problem: "Ollama is not running"
**Solution:**
```bash
# Start Ollama service
ollama serve
```

### Problem: "Model not found"
**Solution:**
```bash
# List available models
ollama list

# Pull the model you want
ollama pull llama3.2
```

### Problem: "Connection refused"
**Solution:**
- Make sure Ollama service is running (`ollama serve`)
- Check that port 11434 is not blocked
- Verify OLLAMA_HOST in `.env.local` is correct

### Problem: "Response too slow"
**Solution:**
- Use a smaller model: `OLLAMA_MODEL=llama3.2:1b`
- Or limit the number of candidates analyzed at once
- Consider upgrading your hardware (GPU helps)

## Switching Between Mock and Ollama

### Use Ollama:
```env
USE_OLLAMA=true
```

### Use Mock Algorithm (no LLM):
```env
USE_OLLAMA=false
```
or simply remove the line

## Performance Tips

### 1. Choose the Right Model
- **For speed**: Use `llama3.2:1b` (1B parameters)
- **For quality**: Use `llama3.2` (3B parameters)
- **For best results**: Use `llama3.1` (8B parameters)

### 2. Optimize Ollama
```bash
# Set number of GPU layers (if you have a GPU)
ollama run llama3.2 --num-gpu 32

# Limit context size for faster responses
ollama run llama3.2 --num-ctx 2048
```

### 3. Hardware Recommendations
- **Minimum**: 8GB RAM, Any CPU
- **Recommended**: 16GB RAM, Modern CPU
- **Optimal**: 16GB+ RAM, NVIDIA GPU (for acceleration)

## Comparing Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| llama3.2:1b | ~1GB | ⚡⚡⚡ | ⭐⭐⭐ | Testing, Quick results |
| llama3.2 | ~2GB | ⚡⚡ | ⭐⭐⭐⭐ | Production (recommended) |
| mistral | ~4GB | ⚡ | ⭐⭐⭐⭐ | Balanced quality/speed |
| llama3.1 | ~5GB | ⚡ | ⭐⭐⭐⭐⭐ | Best quality |

## Example Workflow

1. **Start Ollama server:**
   ```bash
   ollama serve
   ```

2. **In another terminal, pull a model:**
   ```bash
   ollama pull llama3.2
   ```

3. **Create `.env.local`:**
   ```env
   USE_OLLAMA=true
   OLLAMA_MODEL=llama3.2
   ```

4. **Start your app:**
   ```bash
   npm run dev
   ```

5. **Use the application:**
   - Enter a job description
   - Click "Start Matching"
   - Watch as Ollama analyzes candidates with AI reasoning!

## Monitoring Ollama

### Check running models:
```bash
ollama list
```

### View server logs:
```bash
# Ollama outputs logs where it's running
# Check the terminal where you ran `ollama serve`
```

### Stop Ollama:
```bash
# Just Ctrl+C in the terminal where `ollama serve` is running
```

## Advanced Configuration

### Custom Ollama Host (Remote Server)
If running Ollama on another machine:
```env
OLLAMA_HOST=http://192.168.1.100:11434
```

### Fine-tuning Temperature
Lower temperature = more consistent results
```typescript
// In route.ts, adjust:
options: {
  temperature: 0.1,  // More deterministic
  top_p: 0.9,
}
```

## FAQ

**Q: Do I need internet after installing?**
A: No! After downloading models, everything runs locally.

**Q: How much does it cost?**
A: It's completely free. No API charges.

**Q: Can I use multiple models?**
A: Yes, pull multiple models and switch via `OLLAMA_MODEL` in `.env.local`

**Q: Is it faster than OpenAI?**
A: Depends on your hardware. On good hardware, it can be very fast and has no network latency.

**Q: Can I run this in production?**
A: Yes, but ensure your server has enough RAM and CPU/GPU resources.

## Getting Help

- Ollama Documentation: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library
- Issues: https://github.com/ollama/ollama/issues

## Next Steps

After setting up Ollama, you can:
1. Test different models to find the best balance of speed/quality
2. Customize the system prompt in `app/api/match/route.ts`
3. Adjust temperature and other parameters for better results
4. Monitor performance and optimize as needed
