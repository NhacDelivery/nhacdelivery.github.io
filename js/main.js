(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     0. Clean URL Normalization (GitHub Pages / HTTP servers)
     ------------------------------------------------------------------------ */
  if (window.location.protocol !== 'file:' && window.history && window.history.replaceState) {
    const path = window.location.pathname;
    if (path.endsWith('/index.html')) {
      const cleanPath = path.slice(0, -10) || '/';
      window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
    } else if (path.endsWith('.html')) {
      window.history.replaceState(null, '', path.slice(0, -5) + window.location.search + window.location.hash);
    }
  }

  /* ------------------------------------------------------------------------
     1. Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function setDrawerState(isOpen) {
    if (!hamburgerBtn || !mobileDrawer) return;
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    hamburgerBtn.setAttribute(
      'aria-label',
      isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
    );
    mobileDrawer.classList.toggle('open', isOpen);
    mobileDrawer.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      mobileDrawer.removeAttribute('inert');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer.setAttribute('inert', '');
      document.body.style.overflow = '';
    }
  }

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      setDrawerState(!expanded);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => setDrawerState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        setDrawerState(false);
        hamburgerBtn.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Material 3 Snackbar Notification
     ------------------------------------------------------------------------ */
  const snackbar = document.getElementById('snackbar');
  let snackbarTimer = null;

  function showSnackbar(message) {
    if (!snackbar) return;
    snackbar.textContent = message;
    snackbar.classList.add('show');
    clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(() => {
      snackbar.classList.remove('show');
    }, 2600);
  }

  /* ------------------------------------------------------------------------
     3. Material 3 Ripple Effect
     ------------------------------------------------------------------------ */
  document.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('.ripple-target');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'm3-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });

  /* ------------------------------------------------------------------------
     4. Phone Prints Carousel (Home Page)
     ------------------------------------------------------------------------ */
  const printsCarousel = document.getElementById('printsCarousel');
  const printsTrack = document.getElementById('printsTrack');
  const printDots = document.querySelectorAll('#printDots .c-dot');
  const printCaption = document.getElementById('printCaption');
  const prevPrint = document.getElementById('prevPrint');
  const nextPrint = document.getElementById('nextPrint');

  const PRINT_CAPTIONS = [
    'Início • Descoberta',
    'Produto • Detalhes e Chat',
    'Pedido • Comprovante Nhac',
    'Rastreio • Mapa ao Vivo',
    'Chat • Conversa com a Loja',
    'Feed • Comunidade Nhac',
    'Feed • Avaliações e Lojas'
  ];

  if (printsTrack && printDots.length > 0) {
    let currentSlide = 0;
    let autoPlayId = null;

    function goToSlide(index) {
      const total = printDots.length;
      currentSlide = (index + total) % total;
      printsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      printDots.forEach((dot, idx) => {
        const selected = idx === currentSlide;
        dot.classList.toggle('active', selected);
        dot.setAttribute('aria-selected', String(selected));
      });

      if (printCaption) {
        printCaption.textContent = PRINT_CAPTIONS[currentSlide] || '';
      }
    }

    function stopAutoPlay() {
      if (autoPlayId) {
        clearInterval(autoPlayId);
        autoPlayId = null;
      }
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      autoPlayId = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 4200);
    }

    printDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        stopAutoPlay();
        goToSlide(Number(dot.dataset.slide));
      });
    });

    if (prevPrint) {
      prevPrint.addEventListener('click', () => {
        stopAutoPlay();
        goToSlide(currentSlide - 1);
      });
    }

    if (nextPrint) {
      nextPrint.addEventListener('click', () => {
        stopAutoPlay();
        goToSlide(currentSlide + 1);
      });
    }

    if (printsCarousel) {
      let touchStartX = 0;
      let interactTimer = null;

      function revealControls() {
        printsCarousel.classList.add('is-interacted');
        clearTimeout(interactTimer);
        interactTimer = setTimeout(() => {
          printsCarousel.classList.remove('is-interacted');
        }, 3000);
      }

      printsCarousel.addEventListener('pointerdown', revealControls);

      printsCarousel.addEventListener(
        'touchstart',
        (event) => {
          touchStartX = event.changedTouches[0].clientX;
          revealControls();
        },
        { passive: true }
      );

      printsCarousel.addEventListener(
        'touchend',
        (event) => {
          const diffX = event.changedTouches[0].clientX - touchStartX;
          if (Math.abs(diffX) > 36) {
            stopAutoPlay();
            goToSlide(diffX < 0 ? currentSlide + 1 : currentSlide - 1);
          }
        },
        { passive: true }
      );
    }

    startAutoPlay();
  }

  /* ------------------------------------------------------------------------
     5. Download Accordion & Live GitHub Releases (Download Page)
     ------------------------------------------------------------------------ */
  const accordionItems = document.querySelectorAll('#downloadAccordion .acc-item');
  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.acc-trigger');
    const panel = item.querySelector('.acc-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      item.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
      panel.setAttribute('aria-hidden', String(!willOpen));
      if (willOpen) {
        panel.removeAttribute('inert');
      } else {
        panel.setAttribute('inert', '');
      }
    });
  });

  const releaseItems = document.querySelectorAll('[data-release-repo]');
  releaseItems.forEach((item) => {
    const repo = item.dataset.releaseRepo;
    if (!repo) return;

    fetch(`https://api.github.com/repos/${repo}/releases?per_page=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((releases) => {
        if (!Array.isArray(releases) || releases.length === 0) return;
        const latest = releases[0];
        const apkAsset = (latest.assets || []).find((a) => a.name && a.name.endsWith('.apk'));
        if (!apkAsset) return;

        const sizeEl = item.querySelector('[data-field="size"]');
        const dlBtn = item.querySelector('[data-field="download-btn"]');

        if (sizeEl && apkAsset.size) {
          sizeEl.textContent = `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB`;
        }
        if (dlBtn && apkAsset.browser_download_url) {
          dlBtn.href = apkAsset.browser_download_url;
        }
      })
      .catch(() => {
        // Keeps the static fallback metadata rendered in HTML
      });
  });

  /* ------------------------------------------------------------------------
     6. Ecosystem Segmented Tabs (Ecossistema Page)
     ------------------------------------------------------------------------ */
  const ECO_MODULES = {
    cliente: {
      badge: 'Flutter • Dart',
      title: 'App do Cliente (Nhac)',
      desc: 'Aplicativo principal desenvolvido em Flutter com SDK 3.2+, navegação declarativa via GoRouter, gerenciamento de estado com Provider e consumo de APIs via Dio.',
      chips: [
        'Firebase Auth & Firestore',
        'Google Maps & Places',
        'Stripe & Asaas Pix',
        'Sentry Monitoring'
      ],
      url: 'https://github.com/NhacDelivery/Nhac',
      linkText: 'Abrir repositório'
    },
    lojista: {
      badge: 'Web • Gestão de Lojas',
      title: 'Painel do Lojista',
      desc: 'Plataforma web para restaurantes e estabelecimentos gerenciarem cardápios, cupons, atendimento via chat e acompanhamento de pedidos recebidos.',
      chips: [
        'Gestão de Cardápio',
        'Pedidos em Tempo Real',
        'Chat com Clientes',
        'Deploy na Vercel'
      ],
      url: 'https://nhac-lojista-web.vercel.app/',
      linkText: 'Acessar painel web'
    },
    entregador: {
      badge: 'Flutter • Logística',
      title: 'App para Entregadores',
      desc: 'Fluxo dedicado ao parceiro entregador para aceitar corridas, visualizar rotas até o cliente e confirmar entregas com agilidade.',
      chips: [
        'Modo Entregadores',
        'Geolocalização',
        'Rotas no Mapa',
        'Status de Entrega'
      ],
      url: 'https://github.com/NhacDelivery/Nhac-Motoboy',
      linkText: 'Ver Nhac-Motoboy'
    },
    backend: {
      badge: 'Java • Spring Boot',
      title: 'Backend Nhac API',
      desc: 'Serviço responsável pelas regras de negócio, integração financeira, autenticação e mensageria em tempo real via WebSocket (STOMP).',
      chips: [
        'Java & Spring Boot',
        'STOMP WebSocket',
        'Firebase Cloud Messaging',
        'APIs REST'
      ],
      url: 'https://github.com/NhacDelivery/backend-nhac',
      linkText: 'Ver backend-nhac'
    }
  };

  const ecoBtns = document.querySelectorAll('[data-eco]');
  const ecoBadge = document.getElementById('ecoBadge');
  const ecoTitle = document.getElementById('ecoTitle');
  const ecoDesc = document.getElementById('ecoDesc');
  const ecoChips = document.getElementById('ecoChips');
  const ecoLink = document.getElementById('ecoLink');
  const ecoLinkText = document.getElementById('ecoLinkText');

  ecoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const data = ECO_MODULES[btn.dataset.eco];
      if (!data) return;

      ecoBtns.forEach((item) => {
        const selected = item === btn;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', String(selected));
      });

      if (ecoBadge) ecoBadge.textContent = data.badge;
      if (ecoTitle) ecoTitle.textContent = data.title;
      if (ecoDesc) ecoDesc.textContent = data.desc;
      if (ecoLink) ecoLink.href = data.url;
      if (ecoLinkText) ecoLinkText.textContent = data.linkText;

      if (ecoChips) {
        ecoChips.innerHTML = '';
        data.chips.forEach((chipText) => {
          const span = document.createElement('span');
          span.className = 'm3-chip';
          span.textContent = chipText;
          ecoChips.appendChild(span);
        });
      }
    });
  });

  /* ------------------------------------------------------------------------
     7. Color Swatches Copy-to-Clipboard
     ------------------------------------------------------------------------ */
  const swatchCards = document.querySelectorAll('[data-hex]');
  swatchCards.forEach((card) => {
    card.addEventListener('click', async () => {
      const hex = card.dataset.hex;
      if (!hex) return;
      try {
        await navigator.clipboard.writeText(hex);
        showSnackbar(`Cor ${hex} copiada!`);
      } catch {
        showSnackbar(`Cor selecionada: ${hex}`);
      }
    });
  });

  /* ------------------------------------------------------------------------
     8. GitHub Team Live Profile Sync (Equipe Page)
     ------------------------------------------------------------------------ */
  const teamCards = document.querySelectorAll('[data-github-user]');
  const teamLoading = document.getElementById('teamLoading');
  const teamLottieEl = document.getElementById('teamLottie');

  function waitForImage(img) {
    if (!img) return Promise.resolve();
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  if (teamCards.length > 0) {
    let teamLottieAnim = null;
    if (teamLottieEl && window.lottie) {
      teamLottieAnim = window.lottie.loadAnimation({
        container: teamLottieEl,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/loading_nhac.json'
      });
    }

    const profilePromises = Array.from(teamCards).map((card) => {
      const username = card.dataset.githubUser;
      const img = card.querySelector('.team-avatar img');
      if (!username) return waitForImage(img);

      return fetch(`https://api.github.com/users/${encodeURIComponent(username)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((profile) => {
          if (profile && profile.login) {
            const nameEl = card.querySelector('.gh-name');
            const handleEl = card.querySelector('.gh-handle');

            const displayName = (profile.name && profile.name.trim()) || profile.login;
            if (img && profile.avatar_url) {
              img.src = profile.avatar_url;
              img.alt = `Foto de perfil de ${displayName}`;
            }
            if (nameEl) {
              nameEl.textContent = displayName;
            }
            if (handleEl) {
              handleEl.textContent = `@${profile.login} • GitHub`;
            }
          }
          return waitForImage(img);
        })
        .catch(() => waitForImage(img));
    });

    const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 6000));

    Promise.race([Promise.allSettled(profilePromises), safetyTimeout]).then(() => {
      if (teamLoading) {
        teamLoading.classList.add('is-done');
        setTimeout(() => {
          teamLoading.hidden = true;
          if (teamLottieAnim) {
            teamLottieAnim.destroy();
          }
        }, 260);
      } else if (teamLottieAnim) {
        teamLottieAnim.destroy();
      }
    });
  }

  /* ------------------------------------------------------------------------
     9. Inline PDF Documentation Viewer (Documentação Page)
     ------------------------------------------------------------------------ */
  const pdfShell = document.querySelector('.pdf-viewer-shell');
  const pdfPagesContainer = document.getElementById('pdfPagesContainer');
  const pdfPageInfo = document.getElementById('pdfPageInfo');
  const pdfZoomIn = document.getElementById('pdfZoomIn');
  const pdfZoomOut = document.getElementById('pdfZoomOut');

  if (pdfShell && pdfPagesContainer) {
    const pdfUrl = pdfShell.dataset.pdfUrl;
    let pdfDoc = null;
    let zoomFactor = 1;
    let renderToken = 0;

    function showFallbackEmbed() {
      if (pdfPageInfo) {
        pdfPageInfo.textContent = 'Visualizador nativo do navegador';
      }
      pdfPagesContainer.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.className = 'pdf-fallback-frame';
      iframe.src = pdfUrl;
      iframe.title = 'Documentação do projeto Nhac';
      pdfPagesContainer.appendChild(iframe);
    }

    async function renderAllPdfPages() {
      if (!pdfDoc) return;
      const token = ++renderToken;
      const availableWidth = Math.max(260, pdfPagesContainer.clientWidth - 32);
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);

      pdfPagesContainer.innerHTML = '';

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += 1) {
        if (token !== renderToken) return;
        const page = await pdfDoc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = (availableWidth / baseViewport.width) * zoomFactor;
        const viewport = page.getViewport({ scale: fitScale });

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;

        const ctx = canvas.getContext('2d');
        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
        pdfPagesContainer.appendChild(canvas);

        await page.render({
          canvasContext: ctx,
          viewport,
          transform
        }).promise;
      }
    }

    if (window.pdfjsLib && pdfUrl) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      window.pdfjsLib
        .getDocument(pdfUrl)
        .promise.then((doc) => {
          pdfDoc = doc;
          if (pdfPageInfo) {
            pdfPageInfo.textContent = `${doc.numPages} páginas`;
          }
          return renderAllPdfPages();
        })
        .catch(() => {
          showFallbackEmbed();
        });

      if (pdfZoomIn) {
        pdfZoomIn.addEventListener('click', () => {
          zoomFactor = Math.min(1.8, Number((zoomFactor + 0.2).toFixed(1)));
          renderAllPdfPages();
        });
      }

      if (pdfZoomOut) {
        pdfZoomOut.addEventListener('click', () => {
          zoomFactor = Math.max(0.8, Number((zoomFactor - 0.2).toFixed(1)));
          renderAllPdfPages();
        });
      }
    } else {
      showFallbackEmbed();
    }
  }

  /* ------------------------------------------------------------------------
     10. Scroll Reveal
     ------------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal-ready');
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
})();
