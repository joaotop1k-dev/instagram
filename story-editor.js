/* Instaflow Story Editor: imagem pronta para link manual ou Story simples via API oficial. */
(function () {
  "use strict";
  window.InstaStoryEditor = async function (root, deps) {
    const api = deps.api, esc = deps.esc, head = deps.head;
    const styleId = "instaflow-story-editor-css";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = [
        ".se-shell{display:grid;grid-template-columns:minmax(270px,380px) minmax(290px,1fr);gap:22px;align-items:start}",
        ".se-card{background:rgb(var(--surface));border:1px solid rgb(var(--line));border-radius:14px;padding:20px}",
        ".se-stack{display:grid;gap:15px}.se-label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}",
        ".se-help{font-size:12px;color:rgb(var(--muted));line-height:1.5;margin:6px 0 0}",
        ".se-stage{position:relative;aspect-ratio:9/16;width:min(100%,330px);margin:auto;overflow:hidden;border-radius:18px;border:1px solid rgb(var(--line));background:linear-gradient(155deg,#202436,#09090f 68%);touch-action:none}",
        ".se-stage>img,.se-stage>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}",
        ".se-placeholder{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;color:#b3b4c3;font-size:14px}",
        ".se-shade{position:absolute;inset:0;background:linear-gradient(transparent 65%,rgba(0,0,0,.36));pointer-events:none}",
        ".se-overlay{position:absolute;transform:translate(-50%,-50%);max-width:90%;min-width:40%;text-align:center;white-space:normal;word-break:break-word;border-radius:13px;padding:11px 16px;background:rgba(12,13,22,.86);border:1px solid rgba(255,255,255,.25);box-shadow:0 5px 18px rgba(0,0,0,.35);font-weight:800;line-height:1.2;user-select:none;touch-action:none;cursor:grab}",
        ".se-overlay:active{cursor:grabbing}.se-mention{position:absolute;transform:translate(-50%,-50%);background:rgba(5,5,10,.7);color:white;padding:4px 10px;border-radius:8px;font-size:12px;pointer-events:none;white-space:nowrap}",
        ".se-swatch{width:31px;height:31px;border:2px solid rgba(255,255,255,.2);border-radius:50%;cursor:pointer}",
        ".se-swatch[aria-pressed=true]{outline:2px solid rgb(var(--accent));outline-offset:3px}",
        ".se-slider{width:100%;accent-color:rgb(var(--accent));cursor:pointer}.se-input{width:100%;min-height:41px}",
        ".se-warning{border:1px solid rgb(240 160 50/.35);background:rgb(240 160 50/.07);padding:12px;border-radius:9px;font-size:13px;line-height:1.5}",
        ".se-actions{display:grid;gap:9px}.se-preview{position:sticky;top:76px}.se-file{border:2px dashed rgb(var(--line));border-radius:12px;padding:18px;cursor:pointer;display:grid;place-items:center;text-align:center;gap:5px;min-height:96px}",
        ".se-file:hover,.se-file:focus-within{border-color:rgb(var(--accent))}.se-file.dragover{border-color:rgb(var(--accent));background:rgb(var(--accent)/.07)}",
        ".se-msg{margin:0;font-size:13px;white-space:pre-wrap;line-height:1.5}.se-msg[data-tone=bad]{color:rgb(var(--bad))}.se-msg[data-tone=ok]{color:rgb(var(--ok))}",
        "@media(max-width:850px){.se-shell{grid-template-columns:1fr}.se-preview{position:static;order:-1}.se-stage{width:min(100%,260px)}.se-card{padding:16px}}"
      ].join("");
      document.head.appendChild(style);
    }

    let accounts = [];
    try {
      const response = await api("/accounts");
      accounts = (response.accounts || []).filter(function (a) { return a.status === "active"; });
    } catch (error) {
      root.innerHTML = head("Story com link", "Monte sua arte para o Instagram") +
        '<section class="panel pad"><p class="small">Não consegui consultar as contas: ' + esc(error.message) +
        '</p><p class="hint">O bloqueio temporário de cota do Supabase pode impedir o acesso. O editor será liberado quando a API voltar a responder.</p></section>';
      return;
    }
    const S = { file: null, kind: "", url: "", fileName: "", link: "", text: "Clique Aqui 👆", color: "#ffffff",
      size: 115, x: 0.5, y: 0.74, profile: "", draw: true, busy: false };
    const colors = ["#ffffff", "#111111", "#2465ed", "#ed2d69", "#12c6a3"];
    root.innerHTML = head("Story com link", "Crie uma imagem de Story com botão e prepare o link para adicionar no aplicativo") +
      '<div class="se-shell"><section class="se-card se-stack">' +
      '<div><label class="se-label" for="se-account">Publicando em</label><select class="field se-input" id="se-account">' +
      (accounts.length ? accounts.map(function (a) { return '<option value="' + esc(a.id) + '">@' + esc(a.username) + '</option>'; }).join("") : '<option value="">Conecte uma conta ativa</option>') +
      '</select></div>' +
      '<div><span class="se-label">Foto ou vídeo</span><label class="se-file" id="se-drop" for="se-file"><strong id="se-file-name">Arraste a foto ou vídeo</strong><span class="se-help">ou clique para escolher (até 50 MB)</span><input id="se-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,video/mp4,video/quicktime" class="sr"></label></div>' +
      '<div><label class="se-label" for="se-link">Link</label><input id="se-link" type="url" class="field se-input" placeholder="https://seusite.com.br" maxlength="2048" autocomplete="url"><p class="se-help">O link clicável precisa ser colocado com o sticker Link dentro do Instagram.</p></div>' +
      '<div><span class="se-label">Cor do texto</span><div id="se-colors" class="row" style="gap:12px;flex-wrap:wrap">' +
      colors.map(function (c) { return '<button type="button" class="se-swatch" data-color="' + c + '" style="background:' + c + '" aria-label="Cor ' + c + '" aria-pressed="' + (c === S.color) + '"></button>'; }).join("") +
      '</div></div>' +
      '<div><label class="se-label" for="se-size">Tamanho do botão <span id="se-size-label">115%</span></label><input id="se-size" class="se-slider" type="range" min="70" max="160" value="115" step="5"><p class="se-help">Arraste o botão na prévia para escolher onde ele fica.</p></div>' +
      '<details><summary style="cursor:pointer;font-size:13px">Mais opções</summary><div class="se-stack" style="padding-top:14px">' +
      '<div><label class="se-label" for="se-text">Texto do botão</label><input id="se-text" class="field se-input" maxlength="44" value="Clique Aqui 👆"><p class="se-help">A arte ficará visível, mas o desenho não torna o botão clicável.</p></div>' +
      '<div><label class="se-label" for="se-profile">Marcar um perfil (visual)</label><input id="se-profile" class="field se-input" placeholder="@perfil" maxlength="31"><p class="se-help">O nome será desenhado na imagem, não é uma marcação interativa.</p></div>' +
      '<div><label class="se-label" for="se-x">Posição horizontal</label><input id="se-x" class="se-slider" type="range" min="12" max="88" value="50"></div>' +
      '<div><label class="se-label" for="se-y">Posição vertical</label><input id="se-y" class="se-slider" type="range" min="22" max="82" value="74"></div></div></details>' +
      '<label class="row small" style="align-items:center;gap:9px"><input type="checkbox" id="se-draw" checked> Desenhar o botão na mídia (fotos)</label>' +
      '<div class="se-warning" id="se-warning">O Instagram não permite adicionar stickers de link pela API oficial. Para um link clicável, baixe a arte, abra o Instagram e adicione o sticker Link.</div>' +
      '<div class="se-actions"><button id="se-download" class="btn primary" type="button">Baixar story preparado</button>' +
      '<button id="se-copy" class="btn" type="button">Copiar link para o sticker</button>' +
      '<button id="se-publish" class="btn" type="button">Publicar story simples agora (sem link)</button></div>' +
      '<p id="se-msg" class="se-msg" role="status" aria-live="polite"></p></section>' +
      '<section class="se-card se-preview"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:12px"><strong>Prévia do Story</strong><span class="xs muted">9:16</span></div>' +
      '<div class="se-stage" id="se-stage" aria-label="Prévia vertical. Arraste o botão para posicionar">' +
      '<div class="se-placeholder" id="se-placeholder">Arraste a foto ou vídeo<br>ou escolha ao lado</div>' +
      '<img id="se-img" alt="Prévia da imagem" hidden><video id="se-video" controls muted playsinline preload="none" hidden></video>' +
      '<div class="se-shade"></div><div class="se-mention" id="se-mention" hidden></div><div class="se-overlay" id="se-overlay">Clique Aqui 👆</div></div>' +
      '<p class="se-help" style="text-align:center">Prévia ilustrativa. Botões e perfis não ficam clicáveis só por estarem desenhados na arte.</p>' +
      '<a class="btn ghost sm" style="display:block;text-align:center;margin-top:12px" href="#/compose">Voltar ao agendador tradicional</a></section></div>';

    function el(id) { return root.querySelector("#" + id); }
    function message(text, tone) { el("se-msg").textContent = text; el("se-msg").dataset.tone = tone || ""; }
    function validLink() {
      const value = S.link.trim();
      if (!value) return true;
      try { return ["https:", "http:"].includes(new URL(value).protocol); } catch (_) { return false; }
    }
    function update() {
      const box = el("se-overlay"), mention = el("se-mention");
      box.textContent = S.text.trim() || "Clique Aqui 👆";
      box.style.left = (S.x * 100) + "%"; box.style.top = (S.y * 100) + "%";
      box.style.fontSize = (Math.round(14 * S.size / 100)) + "px"; box.style.color = S.color;
      box.hidden = !S.draw;
      mention.textContent = S.profile.trim().replace(/^@/, "") ? "@" + S.profile.trim().replace(/^@/, "") : "";
      mention.hidden = !S.draw || !mention.textContent;
      mention.style.left = (S.x * 100) + "%"; mention.style.top = ((S.y - 0.105) * 100) + "%";
      el("se-size-label").textContent = S.size + "%";
      el("se-x").value = Math.round(S.x * 100); el("se-y").value = Math.round(S.y * 100);
      root.querySelectorAll("[data-color]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.color === S.color)); });
      el("se-publish").disabled = !S.file || !!S.link.trim() || !accounts.length || S.busy || (S.kind === "video" && S.draw);
      el("se-download").disabled = !S.file || !validLink() || S.busy;
      el("se-copy").disabled = !S.link.trim() || !validLink();
      el("se-warning").textContent = S.kind === "video" && S.draw
        ? "Vídeos: a prévia mostra o botão, mas ele não pode ser incorporado ao vídeo neste editor. Para um link clicável, baixe o vídeo e adicione o sticker Link e o texto diretamente no Instagram."
        : S.link.trim()
          ? "Link informado: prepare o arquivo e adicione o sticker Link no aplicativo do Instagram. A API oficial não publica stickers clicáveis."
          : "Sem link: você pode publicar um Story simples pela automação. Se precisar de sticker clicável, informe um link e finalize no Instagram.";
    }
    function setFilePreview() {
      const img = el("se-img"), video = el("se-video"), placeholder = el("se-placeholder");
      img.hidden = S.kind !== "image"; video.hidden = S.kind !== "video";
      placeholder.hidden = !!S.file;
      if (S.kind === "image") { video.removeAttribute("src"); video.load(); img.src = S.url; }
      else if (S.kind === "video") { img.removeAttribute("src"); video.src = S.url; }
      el("se-file-name").textContent = S.fileName || "Arraste a foto ou vídeo";
      update();
    }
    async function chooseFile(file) {
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) return message("O arquivo deve ter no máximo 50 MB.", "bad");
      const image = file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
      const video = /^(video\/mp4|video\/quicktime)$/.test(file.type);
      if (!image && !video) return message("Use imagem JPEG/PNG/WebP/HEIC ou vídeo MP4/MOV.", "bad");
      message("Preparando arquivo...");
      try {
        const local = image ? (await deps.prepareImage(file, "story")).file : file;
        if (S.url) URL.revokeObjectURL(S.url);
        S.file = local; S.kind = image ? "image" : "video"; S.fileName = file.name;
        S.url = URL.createObjectURL(local);
        setFilePreview();
        message("Arquivo pronto. A prévia usa somente seu navegador.", "ok");
      } catch (error) { message(error.message, "bad"); }
    }
    function roundBox(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, width, height, radius);
      else ctx.rect(x, y, width, height);
    }
    async function createImageFile() {
      const bmp = await createImageBitmap(S.file);
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1920;
      const cx = canvas.getContext("2d");
      cx.fillStyle = "#09090e"; cx.fillRect(0, 0, canvas.width, canvas.height);
      const zoom = Math.max(canvas.width / bmp.width, canvas.height / bmp.height);
      const w = bmp.width * zoom, h = bmp.height * zoom;
      cx.drawImage(bmp, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      bmp.close();
      if (S.draw) {
        const label = S.text.trim() || "Clique Aqui 👆";
        let font = Math.round(48 * S.size / 100);
        cx.font = "800 " + font + "px system-ui,Arial,sans-serif";
        while (cx.measureText(label).width > 820 && font > 22) {
          font -= 2; cx.font = "800 " + font + "px system-ui,Arial,sans-serif";
        }
        const tw = Math.min(950, cx.measureText(label).width + 116);
        const th = Math.max(100, font * 2.0), px = Math.max(tw / 2 + 24, Math.min(1080 - tw / 2 - 24, S.x * 1080)), py = S.y * 1920;
        cx.fillStyle = "rgba(7,9,17,.90)"; cx.strokeStyle = "rgba(255,255,255,.38)"; cx.lineWidth = 3;
        roundBox(cx, px - tw / 2, py - th / 2, tw, th, 27); cx.fill(); cx.stroke();
        cx.fillStyle = S.color; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, px, py, tw - 40);
        const who = S.profile.trim().replace(/^@/, "");
        if (who) {
          cx.font = "700 39px system-ui,Arial,sans-serif";
          const rw = Math.min(820, cx.measureText("@" + who).width + 65), ry = py - th / 2 - 66;
          cx.fillStyle = "rgba(4,5,11,.72)";
          roundBox(cx, px - rw / 2, ry - 30, rw, 62, 16); cx.fill();
          cx.fillStyle = "#ffffff"; cx.fillText("@" + who, px, ry, rw - 30);
        }
      }
      let quality = .9, blob;
      do {
        blob = await new Promise(function (resolve) { canvas.toBlob(resolve, "image/jpeg", quality); });
        if (!blob) throw Error("Falha ao gerar a imagem.");
        quality -= .1;
      } while (blob.size > 8 * 1024 * 1024 && quality >= .5);
      if (blob.size > 8 * 1024 * 1024) throw Error("Arte acima de 8 MB. Escolha outra foto.");
      return new File([blob], "story-instaflow.jpg", { type: "image/jpeg" });
    }
    async function getPreparedFile() {
      if (S.kind === "image") return createImageFile();
      if (S.kind === "video" && S.draw) throw Error("Não é possível gravar este botão em um vídeo aqui. Desmarque a opção ou adicione texto e sticker pelo Instagram.");
      return (await deps.prepareVideo(S.file, "story")).file;
    }
    async function download() {
      if (!S.file) return message("Escolha primeiro uma foto ou vídeo.", "bad");
      if (!validLink()) return message("Informe um link que comece com https:// ou http://.", "bad");
      message("Preparando arquivo para download...");
      try {
        let output;
        if (S.kind === "video") {
          output = S.file;
          if (S.draw) message("Vídeo baixado sem botão incorporado. Adicione o texto e o sticker Link dentro do Instagram.", "ok");
        } else {
          output = await createImageFile();
        }
        const link = URL.createObjectURL(output), a = document.createElement("a");
        a.href = link; a.download = S.kind === "video" ? (S.fileName || "story.mp4") : "story-instaflow.jpg";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(link); }, 10000);
        if (S.kind === "image") message("Imagem pronta! No Instagram: Novo Story → escolha a imagem → Figurinhas → Link → cole a URL.", "ok");
      } catch (error) { message(error.message, "bad"); }
    }
    async function publish() {
      if (!S.file || S.busy) return;
      if (S.link.trim()) return message("Para garantir um link clicável, baixe o Story e adicione o sticker Link pelo Instagram. A API não suporta stickers.", "bad");
      if (!el("se-account").value) return message("Selecione uma conta ativa.", "bad");
      if (!confirm("Publicar Story sem sticker clicável pela API oficial? A publicação será enviada à fila imediatamente.")) return;
      S.busy = true; update(); message("Preparando e enviando arquivo...");
      try {
        const output = await getPreparedFile();
        const media = await api("/media", { method:"POST", body:{ fileName:output.name, mimeType:output.type, sizeBytes:output.size, keep:false } });
        await deps.putFile(media.uploadUrl, output, function (progress) { message("Enviando arquivo: " + progress + "%"); });
        let completed = await api("/media/" + media.mediaId + "/complete", { method:"POST" });
        if (completed.status === "pending") {
          message("Processando vídeo...");
          completed = await deps.awaitReady(media.mediaId, completed);
        }
        if (completed.status && completed.status !== "ready") throw Error("A mídia ainda não está pronta para publicar.");
        const r = await api("/posts", { method:"POST", body:{
          type:"story", caption:"", options:{}, mediaIds:[media.mediaId], mode:"schedule",
          accounts:[{ accountId:el("se-account").value, times:[new Date(Date.now() + 15000).toISOString()] }]
        } });
        message("Story enviado para publicação! " + (r.targets || 1) + " agendamento criado. Acompanhe na aba Publicações.", "ok");
      } catch (error) { message("Não foi possível enviar: " + error.message, "bad"); }
      finally { S.busy = false; update(); }
    }
    el("se-file").addEventListener("change", function (e) { chooseFile(e.target.files[0]); });
    const drop = el("se-drop");
    ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("dragover"); }); });
    ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("dragover"); }); });
    drop.addEventListener("drop", function (e) { chooseFile(e.dataTransfer.files[0]); });
    el("se-link").addEventListener("input", function (e) { S.link = e.target.value.trim(); update(); });
    el("se-text").addEventListener("input", function (e) { S.text = e.target.value.slice(0,44); update(); });
    el("se-profile").addEventListener("input", function (e) { S.profile = e.target.value.replace(/[^a-zA-Z0-9._@]/g, "").slice(0,31); update(); });
    el("se-size").addEventListener("input", function (e) { S.size = +e.target.value; update(); });
    el("se-draw").addEventListener("change", function (e) { S.draw = e.target.checked; update(); });
    el("se-x").addEventListener("input", function (e) { S.x = +e.target.value / 100; update(); });
    el("se-y").addEventListener("input", function (e) { S.y = +e.target.value / 100; update(); });
    root.querySelectorAll("[data-color]").forEach(function (b) { b.addEventListener("click", function () { S.color = b.dataset.color; update(); }); });
    const stage = el("se-stage"), button = el("se-overlay");
    let dragging = false;
    button.addEventListener("pointerdown", function (e) { if (!S.draw) return; dragging = true; button.setPointerCapture(e.pointerId); e.preventDefault(); });
    button.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const r = stage.getBoundingClientRect();
      S.x = Math.max(.12, Math.min(.88, (e.clientX - r.left) / r.width));
      S.y = Math.max(.22, Math.min(.82, (e.clientY - r.top) / r.height));
      update();
    });
    button.addEventListener("pointerup", function () { dragging = false; });
    button.addEventListener("pointercancel", function () { dragging = false; });
    el("se-download").addEventListener("click", download);
    el("se-publish").addEventListener("click", publish);
    el("se-copy").addEventListener("click", async function () {
      if (!S.link || !validLink()) return message("Informe primeiro um link https:// válido.", "bad");
      try {
        await navigator.clipboard.writeText(S.link);
        message("Link copiado. No Instagram, escolha Figurinha → Link e cole.", "ok");
      } catch (_) { message("Não foi possível copiar automaticamente. Selecione o endereço no campo Link e copie.", "bad"); }
    });
    window.addEventListener("hashchange", function cleanup() {
      if (location.hash.startsWith("#/story")) return;
      if (S.url) URL.revokeObjectURL(S.url);
      window.removeEventListener("hashchange", cleanup);
    });
    update();
  };
})();
