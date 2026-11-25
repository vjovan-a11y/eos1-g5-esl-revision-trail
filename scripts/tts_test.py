import sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
k = Kokoro("./tts/kokoro-v1.0.onnx", "./tts/voices-v1.0.bin")
print([v for v in k.get_voices() if v.startswith(('bf','bm'))])
lines = [("bf_emma","Hi Tom! Did you go to the swimming club on Saturday?"),
         ("bm_george","Yes, I did. I've been going every week since September. My coach says I should practise my breathing more."),
         ("bf_emma","That's great. My name is spelt K-I-R-A, by the way.")]
out=[]
for v,t in lines:
    a,sr = k.create(t, voice=v, speed=0.92, lang="en-gb")
    out.append(a); out.append(np.zeros(int(sr*0.5)))
sf.write("./tts/sample.wav", np.concatenate(out), sr)
print("ok", sr)
