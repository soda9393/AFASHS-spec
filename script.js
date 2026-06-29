        // 1. 책자 3D 넘김 애니메이션 상태 관리
        const bookContainer = document.getElementById('book-container');
        const book = document.getElementById('book');
        const sheets = document.querySelectorAll('.sheet');
        const totalSheets = sheets.length;
        let currentSheet = 0;
        let viewMode = 'double'; // 'double' or 'single'
        let currentPage = 1;
        let recommendedSheetIndex = null;
        let recommendedDeptId = null;

        // 초기 슬라이더 최댓값 설정 (2면 보기 기준)
        document.getElementById('page-slider').max = totalSheets;

        function setViewMode(mode) {
            viewMode = mode;
            const slider = document.getElementById('page-slider');
            const bc = document.getElementById('book-container');

            if (viewMode === 'single') {
                document.getElementById('view-single-btn').classList.add('active');
                document.getElementById('view-double-btn').classList.remove('active');

                // 2면 -> 1면 이동 시 페이지 번호 계산
                if (currentSheet === 0) {
                    currentPage = 1;
                } else if (currentSheet === totalSheets) {
                    currentPage = totalSheets * 2;
                } else {
                    currentPage = currentSheet * 2;
                }

                slider.min = 1;
                slider.max = totalSheets * 2;
                slider.value = currentPage;
                bc.classList.add('single-page-mode');
            } else {
                document.getElementById('view-double-btn').classList.add('active');
                document.getElementById('view-single-btn').classList.remove('active');

                // 1면 -> 2면 이동 시 시트 인덱스 계산
                if (currentPage === 1) {
                    currentSheet = 0;
                } else if (currentPage === totalSheets * 2) {
                    currentSheet = totalSheets;
                } else {
                    if (currentPage % 2 === 0) {
                        currentSheet = currentPage / 2;
                    } else {
                        currentSheet = (currentPage - 1) / 2;
                    }
                }

                slider.min = 0;
                slider.max = totalSheets;
                slider.value = currentSheet;
                bc.classList.remove('single-page-mode');
                bc.classList.remove('show-left');
                bc.classList.remove('show-right');
            }
            updateBookState();
        }

        function updateBookState() {
            let effectiveMode = viewMode;
            if (viewMode === 'double') {
                if (currentSheet === 0) {
                    effectiveMode = 'single';
                    currentPage = 1;
                } else if (currentSheet === totalSheets) {
                    effectiveMode = 'single';
                    currentPage = totalSheets * 2;
                }
            }

            if (effectiveMode === 'single') {
                let isRightPage = (currentPage % 2 !== 0);
                if (isRightPage) {
                    currentSheet = (currentPage - 1) / 2;
                } else {
                    currentSheet = currentPage / 2;
                }

                // 1면 보기 시 정렬 클래스 세팅
                bookContainer.className = 'single-page-mode';

                // 시트 3D 플립 상태 반영 (단일 페이지 오버라이드를 위해 유지)
                for (let i = 0; i < totalSheets; i++) {
                    const sheet = sheets[i];
                    if (i < currentSheet) {
                        sheet.classList.add('flipped');
                        sheet.style.zIndex = i;
                    } else if (i === currentSheet) {
                        sheet.classList.remove('flipped');
                        sheet.style.zIndex = totalSheets;
                    } else {
                        sheet.classList.remove('flipped');
                        sheet.style.zIndex = totalSheets - i;
                    }
                }

                // 1면 보기 시 개별 페이지 활성화 클래스 처리
                const allPageSides = document.querySelectorAll('.sheet .page-side');
                const activePageIndex = currentPage - 1;
                allPageSides.forEach((pageSide, index) => {
                    if (index === activePageIndex) {
                        pageSide.classList.add('active-single-page');
                        pageSide.classList.remove('prev-single-page');
                    } else if (index < activePageIndex) {
                        pageSide.classList.remove('active-single-page');
                        pageSide.classList.add('prev-single-page');
                    } else {
                        pageSide.classList.remove('active-single-page');
                        pageSide.classList.remove('prev-single-page');
                    }
                });

                // 슬라이더 및 인디케이터 동기화
                if (viewMode === 'single') {
                    document.getElementById('page-slider').value = currentPage;
                } else {
                    document.getElementById('page-slider').value = currentSheet;
                }

                const indicator = document.getElementById('page-indicator');
                if (currentPage === 1) {
                    indicator.innerText = "표지 (Page 1)";
                } else if (currentPage === totalSheets * 2) {
                    indicator.innerText = "뒷표지 (Page " + (totalSheets * 2) + ")";
                } else {
                    indicator.innerText = "Page " + currentPage;
                }

                // 조작 버튼 활성/비활성 설정
                if (viewMode === 'single') {
                    document.getElementById('prev-btn').disabled = (currentPage === 1);
                    document.getElementById('next-btn').disabled = (currentPage === totalSheets * 2);
                } else {
                    document.getElementById('prev-btn').disabled = (currentSheet === 0);
                    document.getElementById('next-btn').disabled = (currentSheet === totalSheets);
                }
            } else {
                // 2면 보기 (Double Page Mode)
                bookContainer.className = '';
                if (currentSheet === 0) {
                    bookContainer.classList.add('closed-front');
                    book.classList.remove('is-open');
                } else if (currentSheet === totalSheets) {
                    bookContainer.classList.add('closed-back');
                    book.classList.remove('is-open');
                } else {
                    bookContainer.classList.add('open');
                    book.classList.add('is-open');
                }

                for (let i = 0; i < totalSheets; i++) {
                    const sheet = sheets[i];
                    if (i < currentSheet) {
                        sheet.classList.add('flipped');
                        sheet.style.zIndex = i;
                    } else if (i === currentSheet) {
                        sheet.classList.remove('flipped');
                        sheet.style.zIndex = totalSheets;
                    } else {
                        sheet.classList.remove('flipped');
                        sheet.style.zIndex = totalSheets - i;
                    }
                }

                // 2면 보기 시 개별 페이지 활성화 클래스 해제
                const allPageSides = document.querySelectorAll('.sheet .page-side');
                allPageSides.forEach((pageSide) => {
                    pageSide.classList.remove('active-single-page');
                    pageSide.classList.remove('prev-single-page');
                });

                // 슬라이더 및 인디케이터 동기화
                document.getElementById('page-slider').value = currentSheet;
                const indicator = document.getElementById('page-indicator');
                if (currentSheet === 0) {
                    indicator.innerText = "표지 (Page 1)";
                } else if (currentSheet === totalSheets) {
                    indicator.innerText = "뒷표지 (Page " + (totalSheets * 2) + ")";
                } else {
                    const leftPage = currentSheet * 2;
                    const rightPage = currentSheet * 2 + 1;
                    indicator.innerText = `Page ${leftPage} - ${rightPage}`;
                }

                // 조작 버튼 활성/비활성 설정
                document.getElementById('prev-btn').disabled = (currentSheet === 0);
                document.getElementById('next-btn').disabled = (currentSheet === totalSheets);
            }

            // GNB 목차 내 링크 상태 활성화
            updateTOCLinks();
        }

        function nextPage() {
            if (viewMode === 'single') {
                if (currentPage < totalSheets * 2) {
                    currentPage++;
                    updateBookState();
                }
            } else {
                if (currentSheet < totalSheets) {
                    currentSheet++;
                    updateBookState();
                }
            }
        }

        function prevPage() {
            if (viewMode === 'single') {
                if (currentPage > 1) {
                    currentPage--;
                    updateBookState();
                }
            } else {
                if (currentSheet > 0) {
                    currentSheet--;
                    updateBookState();
                }
            }
        }

        function goToSheet(sheetIndex) {
            if (sheetIndex >= 0 && sheetIndex <= totalSheets) {
                if (viewMode === 'single') {
                    if (sheetIndex === 0) {
                        currentPage = 1;
                    } else if (sheetIndex === totalSheets) {
                        currentPage = totalSheets * 2;
                    } else {
                        currentPage = sheetIndex * 2;
                    }
                } else {
                    currentSheet = sheetIndex;
                }
                updateBookState();
            }
        }

        function handleSliderInput(value) {
            const val = parseInt(value);
            if (viewMode === 'single') {
                if (val >= 1 && val <= totalSheets * 2) {
                    currentPage = val;
                    updateBookState();
                }
            } else {
                if (val >= 0 && val <= totalSheets) {
                    currentSheet = val;
                    updateBookState();
                }
            }
        }

        // 2. 목차 (TOC) 드로워 열기/닫기
        const tocDrawer = document.getElementById('toc-drawer');
        const tocOverlay = document.getElementById('toc-overlay');

        function toggleTOC(show) {
            if (show) {
                tocDrawer.classList.add('active');
                tocOverlay.classList.add('active');
            } else {
                tocDrawer.classList.remove('active');
                tocOverlay.classList.remove('active');
            }
        }

        function jumpToChapter(sheetIndex) {
            goToSheet(sheetIndex);
            toggleTOC(false);
        }

        function updateTOCLinks() {
            const links = document.querySelectorAll('.toc-list li a');
            links.forEach((link) => {
                link.classList.remove('active-link');
            });

            let tocId = `toc-0`;
            if (viewMode === 'single') {
                if (currentPage === 1) tocId = `toc-0`;
                else if (currentPage === 2) tocId = `toc-1`;
                else if (currentPage === 3) tocId = `toc-2`;
                else if (currentPage === 4) tocId = `toc-3`;
                else if (currentPage === 5) tocId = `toc-4`;
                else if (currentPage === 6) tocId = `toc-5`;
                else if (currentPage >= 7 && currentPage <= 10) tocId = `toc-6`;
                else if (currentPage >= 11 && currentPage <= 14) tocId = `toc-7`;
                else if (currentPage >= 15 && currentPage <= 18) tocId = `toc-8`;
                else if (currentPage >= 19 && currentPage <= 22) tocId = `toc-9`;
                else if (currentPage === 23) tocId = `toc-10`;
                else if (currentPage === 24) tocId = `toc-11`;
                else if (currentPage === 25) tocId = `toc-12`;
                else if (currentPage === 26) tocId = `toc-13`;
                else if (currentPage >= 27) tocId = `toc-14`;
            } else {
                if (currentSheet === 0) tocId = `toc-0`;
                else if (currentSheet === 1) tocId = `toc-2`;
                else if (currentSheet === 2) tocId = `toc-4`;
                else if (currentSheet === 3) tocId = `toc-6`;
                else if (currentSheet === 4) tocId = `toc-6`;
                else if (currentSheet === 5) tocId = `toc-7`;
                else if (currentSheet === 6) tocId = `toc-7`;
                else if (currentSheet === 7) tocId = `toc-8`;
                else if (currentSheet === 8) tocId = `toc-8`;
                else if (currentSheet === 9) tocId = `toc-9`;
                else if (currentSheet === 10) tocId = `toc-9`;
                else if (currentSheet === 11) tocId = `toc-10`;
                else if (currentSheet === 12) tocId = `toc-12`;
                else if (currentSheet === 13) tocId = `toc-14`;
            }

            const activeLink = document.getElementById(tocId);
            if (activeLink) activeLink.classList.add('active-link');
        }


        // 3. 아코디언 FAQ 기능
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                question.classList.toggle('active');
                const answer = question.nextElementSibling;
                if (answer.style.maxHeight) {
                    answer.style.maxHeight = null;
                } else {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        });


        // 4. 전공 매칭 테스트 (Quiz) 데이터 및 로직
        const quizQuestions = [
            {
                q: "Q1. 주말에 친구들과 약속을 잡을 때, 나의 행동 양식과 가장 가까운 것은?",
                options: [
                    { text: "시간, 동선, 갈 곳을 분 단위로 미리 계획해 두어야 마음이 편하다.", score: { control: 3 } },
                    { text: "맛집 메뉴의 성분과 평점을 꼼꼼하게 대조하며 가장 믿을 만한 곳을 분석한다.", score: { electronics: 3 } },
                    { text: "단톡방을 열어 친구들의 의견을 부지런히 조율하고 약속 소식을 전파한다.", score: { telecom: 3 } },
                    { text: "계획보다는 일단 몸으로 직접 부딪치며 활동적인 코스를 적극 제안한다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q2. 시험공부를 하려고 책상에 앉았을 때, 내가 가장 먼저 하는 행동은?",
                options: [
                    { text: "오늘 공부할 과목별 목표 시간과 계획을 스케줄러에 딱 정리해둔다.", score: { control: 3 } },
                    { text: "필기구 정돈, 학습 스탠드 각도, 의자 높이를 내게 맞게 미세 세팅한다.", score: { electronics: 3 } },
                    { text: "집중에 방해되는 스마트폰의 모든 메신저와 알림을 일시 차단한다.", score: { telecom: 3 } },
                    { text: "책상 위의 무거운 전공서적과 주변 가구를 탄탄히 각 맞춰 정리정돈한다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q3. 친구들과 방 탈출 카페에 갔을 때, 내가 가장 본능적으로 담당하는 역할은?",
                options: [
                    { text: "남은 제한시간을 틈틈이 체크하며 힌트 쓸 타이밍과 순서를 리드한다.", score: { control: 3 } },
                    { text: "방 안에 널린 힌트들 사이의 앞뒤 인과관계와 패턴을 논리적으로 추리한다.", score: { electronics: 3 } },
                    { text: "비밀번호 자물쇠의 암호 규칙이나 숨겨진 잠금 기믹을 풀어낸다.", score: { telecom: 3 } },
                    { text: "방 내부의 무겁고 단단한 물리 장치나 문을 손으로 밀고 당기며 직접 만져본다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q4. 새로 산 보드게임을 친구들과 처음 즐길 때, 내가 선호하는 방식은?",
                options: [
                    { text: "설명서를 정독해 게임의 상세 규칙과 차례를 완벽히 마스터하고 게임을 주도한다.", score: { control: 3 } },
                    { text: "다양한 캐릭터와 카드 간의 미세한 스펙 차이와 유효한 콤보를 집중 분석한다.", score: { electronics: 3 } },
                    { text: "내 카드와 자원을 남들이 보지 못하게 보안을 잘 지키며 몰래 수를 계산한다.", score: { telecom: 3 } },
                    { text: "게임 말이나 주사위를 직접 굴리고 조작하는 물리적인 재미 자체에 몰입한다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q5. 조별 과제 도중 팀원들 간에 의견 대립이 심해져 조가 엎어질 위기일 때, 나의 해결책은?",
                options: [
                    { text: "양측의 핵심 의견을 정리하여 타협점과 수정된 일정 분담안을 제안한다.", score: { control: 3 } },
                    { text: "갈등이 시작되게 된 구체적인 원인과 오해를 사실에 기반해 조목조목 짚어본다.", score: { electronics: 3 } },
                    { text: "개별적으로 조심스럽게 연락을 이어가며 오해를 풀고 팀워크를 단단히 다진다.", score: { telecom: 3 } },
                    { text: "일단 밖으로 나가서 맛있는 것을 먹자며 친구들의 주의를 환기하고 기분을 풀어준다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q6. 스마트폰에 '개인정보 보호 설정 및 이중 인증 알림'이 떴을 때 나의 대처는?",
                options: [
                    { text: "내가 정해놓은 정기 점검 일정에 부합하는지 전체적인 보안 일정을 체크한다.", score: { control: 3 } },
                    { text: "이번 설정이 폰의 구동 성능이나 배터리에 주는 영향을 검색해 본다.", score: { electronics: 3 } },
                    { text: "찝찝하므로 즉시 복잡한 특수문자 조합으로 비밀번호를 바꾸고 인증을 마친다.", score: { telecom: 3 } },
                    { text: "하는 김에 스마트폰 충전 단자에 이물질이 없는지 털고 겉면 액정을 깨끗이 닦는다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q7. 친구의 특별한 기념일 선물을 고를 때, 내가 가장 중시하는 기준은?",
                options: [
                    { text: "평소 상대방이 필요하다고 넌지시 말했던 실용적이고 유용한 아이템을 선물한다.", score: { control: 3 } },
                    { text: "온라인 쇼핑몰의 최저가, 용량 대비 스펙, 신뢰성 높은 후기들을 꼼꼼하게 따진다.", score: { electronics: 3 } },
                    { text: "정성스러운 포장 박스를 고르고 진심 어린 손편지를 정성껏 한 자 한 자 적어준다.", score: { telecom: 3 } },
                    { text: "시판 제품 대신 내가 직접 블록을 조립하거나 예쁘게 커스터마이징한 완제품을 준다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q8. 길을 가다가 처음 마주한 복잡한 야외 미로 정원에 들어섰을 때, 나의 성향은?",
                options: [
                    { text: "정원 입구의 지도를 머릿속에 외우고 길 찾기 최적의 안전 경로를 계산한다.", score: { control: 3 } },
                    { text: "우회전과 좌회전의 횟수, 벽의 구조적 형태를 논리적으로 계산하며 헤쳐나간다.", score: { electronics: 3 } },
                    { text: "일행과 실시간으로 연락을 취하며 낙오자가 생기지 않도록 안전을 체크한다.", score: { telecom: 3 } },
                    { text: "지도 없이도 우선 직접 발로 뛰어다니며 부딪쳐서 출구를 빠르게 탐색한다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q9. 직접 조립해야 하는 프라모델이나 나노 블록을 선물 받았을 때 조립하는 스타일은?",
                options: [
                    { text: "설명서 가이드라인의 순서 번호 1번부터 어긋남 없이 정밀하게 조립해나간다.", score: { control: 3 } },
                    { text: "각 부품 조각의 설계적인 역할과 내부 기동 관절의 구동 원리를 먼저 해독해본다.", score: { electronics: 3 } },
                    { text: "중요한 미세 부품을 잃어버리지 않게 작은 케이스에 분류하고 보관하며 조립한다.", score: { telecom: 3 } },
                    { text: "설명서는 흘끗 보고 내 맘대로 외관을 튼튼하게 보강하거나 나만의 창작품으로 변형한다.", score: { mechanic: 3 } }
                ]
            },
            {
                q: "Q10. 마트나 백화점에 물건을 쇼핑하러 갔을 때, 가장 두드러지는 나의 모습은?",
                options: [
                    { text: "미리 작성해 둔 쇼핑 리스트 메모장만 보며 최단 동선으로 신속하게 다녀온다.", score: { control: 3 } },
                    { text: "제품 성분 구성표와 유통기한, 단가 대비 용량을 매의 눈으로 파악한다.", score: { electronics: 3 } },
                    { text: "제휴 할인 카드, 적립 쿠폰, 간편결제 캐시백이 안전하게 적용되었는지 살핀다.", score: { telecom: 3 } },
                    { text: "물건을 양손으로 직접 만져보고 묵직함과 견고한 마감 완성도를 확인한 뒤 결정한다.", score: { mechanic: 3 } }
                ]
            }
        ];

        const majorResultData = {
            control: {
                name: "항공통제과",
                desc: "당신은 넓은 시야와 신속한 판단력, 그리고 상황을 조율하고 지휘하는 관제 및 통제 분야에 소질이 있습니다. 영공의 관제 마스터로 추천합니다!",
                emblem: "images/control_emblem.png",
                sheetIndex: 3,
                deptId: "dept-control"
            },
            electronics: {
                name: "항공전자과",
                desc: "당신은 세밀하고 꼼꼼하며 논리적입니다. 복잡한 미세 회로, 전자기기 작동 분석 등 정밀 정보기술을 다루는 데 소질이 있으며, 전투기의 두뇌를 책임지는 스마트 하이테크 정비사 유형입니다!",
                emblem: "images/electronics_emblem.png",
                sheetIndex: 5,
                deptId: "dept-electronics"
            },
            telecom: {
                name: "정보통신과",
                desc: "당신은 사이버 정보 보호와 서버 구축, 그리고 분산된 요소들을 유무선으로 안전하게 연결하는 네트워크 기술에 최적화된 마인드를 지니고 있습니다. 군 정보보안을 지키는 든든한 사이버 방패로 성장이 기대됩니다!",
                emblem: "images/telecom_emblem.png",
                sheetIndex: 7,
                deptId: "dept-telecom"
            },
            mechanic: {
                name: "항공기계과",
                desc: "당신은 물리적인 동작 원리를 만지고 해결하는 것에 큰 매력을 느끼는 현장형 기술인재입니다. 육중한 동체를 다듬고 가스터빈 제트 엔진을 조립 및 정비하여 비행기를 창공으로 쏘아 올리는 정비 명장의 자질이 넘칩니다!",
                emblem: "images/mechanic_emblem.png",
                sheetIndex: 9,
                deptId: "dept-mechanic"
            }
        };

        let currentQuizIndex = 0;
        let quizScores = { control: 0, electronics: 0, telecom: 0, mechanic: 0 };

        function startQuiz() {
            document.getElementById('quiz-start').classList.remove('active');
            document.getElementById('quiz-question').classList.add('active');
            currentQuizIndex = 0;
            quizScores = { control: 0, electronics: 0, telecom: 0, mechanic: 0 };
            showQuestion();
        }

        function showQuestion() {
            const currentQ = quizQuestions[currentQuizIndex];
            document.getElementById('quiz-current-step').innerText = currentQuizIndex + 1;
            document.getElementById('quiz-progress').style.width = ((currentQuizIndex + 1) / quizQuestions.length) * 100 + '%';
            document.getElementById('quiz-question-text').innerText = currentQ.q;

            const optionsContainer = document.getElementById('quiz-options');
            optionsContainer.innerHTML = '';

            const alphas = ['A', 'B', 'C', 'D'];
            currentQ.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.innerHTML = `<span class="option-indicator">${alphas[idx]}</span> <span>${opt.text}</span>`;
                btn.onclick = () => selectOption(opt.score);
                optionsContainer.appendChild(btn);
            });
        }

        function selectOption(score) {
            for (const [major, val] of Object.entries(score)) {
                quizScores[major] += val;
            }

            if (currentQuizIndex < quizQuestions.length - 1) {
                currentQuizIndex++;
                showQuestion();
            } else {
                showResult();
            }
        }

        function showResult() {
            document.getElementById('quiz-question').classList.remove('active');
            document.getElementById('quiz-result').classList.add('active');

            // 가장 점수가 높은 전공 선출
            let recommendedMajor = 'control';
            let maxScore = -1;
            for (const [major, val] of Object.entries(quizScores)) {
                if (val > maxScore) {
                    maxScore = val;
                    recommendedMajor = major;
                }
            }

            const resultData = majorResultData[recommendedMajor];
            const emblemImg = document.getElementById('result-emblem');
            if (emblemImg) {
                emblemImg.src = resultData.emblem;
                emblemImg.style.display = 'inline-block';
            }
            document.getElementById('result-major-name').innerText = resultData.name;
            document.getElementById('result-major-desc').innerText = resultData.desc;

            // 추천된 학과의 sheetIndex 및 elementId 저장
            recommendedDeptId = resultData.deptId;
            recommendedSheetIndex = resultData.sheetIndex;
        }

        function goToRecommendedDept() {
            if (recommendedSheetIndex !== null && recommendedDeptId !== null) {
                // 페이지 넘기기
                goToSheet(recommendedSheetIndex);

                // 골드 테두리 반짝거리는 하이라이트 애니메이션 주기
                const targetDeptCard = document.getElementById(recommendedDeptId);
                if (targetDeptCard) {
                    targetDeptCard.classList.add('glow-highlight');

                    // 4초 후에 하이라이트 제거
                    setTimeout(() => {
                        targetDeptCard.classList.remove('glow-highlight');
                    }, 4000);
                }
            }
        }

        function resetQuiz() {
            document.getElementById('quiz-result').classList.remove('active');
            document.getElementById('quiz-start').classList.add('active');
            const emblemImg = document.getElementById('result-emblem');
            if (emblemImg) emblemImg.style.display = 'none';
            recommendedDeptId = null;
        }

        // 4.1 글자 크기 조절 (Zoom) 기능
        let currentZoom = 1.0;
        function adjustZoom(amount) {
            currentZoom = Math.min(Math.max(currentZoom + amount, 0.8), 1.3); // 최소 80%, 최대 130%
            document.documentElement.style.setProperty('--zoom-level', currentZoom);
            document.getElementById('zoom-indicator').innerText = Math.round(currentZoom * 100) + '%';
        }

        // 4.1.2 Ctrl + 마우스 휠 줌 이벤트 바인딩
        window.addEventListener('wheel', function (e) {
            if (e.ctrlKey) {
                e.preventDefault(); // 브라우저 고유 페이지 줌 방지
                const zoomDelta = e.deltaY < 0 ? 0.05 : -0.05; // 휠 위로 굴리면 확대(+5%), 아래로 굴리면 축소(-5%)
                adjustZoom(zoomDelta);
            }
        }, { passive: false });

        // 4.2 전체화면 토글 기능
        function toggleFullscreen() {
            const btn = document.getElementById('fullscreen-btn');
            if (!document.fullscreenElement &&
                !document.mozFullScreenElement &&
                !document.webkitFullscreenElement &&
                !document.msFullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        }

        function onFullscreenChange() {
            const btn = document.getElementById('fullscreen-btn');
            if (document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement) {
                btn.innerHTML = '🗖 창모드로 보기';
                btn.title = '전체화면 해제';
            } else {
                btn.innerHTML = '🖥️ 전체화면';
                btn.title = '전체화면으로 보기';
            }
        }

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('MSFullscreenChange', onFullscreenChange);

        function checkResponsiveView() {
            const doubleBtn = document.getElementById('view-double-btn');
            const slider = document.getElementById('page-slider');
            if (window.innerWidth <= 768) {
                if (viewMode !== 'single') {
                    viewMode = 'single';
                }
                if (slider) {
                    slider.min = 1;
                    slider.max = totalSheets * 2;
                }
                const activeBtn = document.querySelector('.view-mode-controls .header-btn.active');
                if (activeBtn) activeBtn.classList.remove('active');
                const singleBtn = document.getElementById('view-single-btn');
                if (singleBtn) singleBtn.classList.add('active');
                if (doubleBtn) {
                    doubleBtn.style.display = 'none';
                }
            } else {
                if (slider && viewMode === 'double') {
                    slider.min = 0;
                    slider.max = totalSheets;
                }
                if (doubleBtn) {
                    doubleBtn.style.display = 'inline-flex';
                }
            }
        }

        window.addEventListener('resize', () => {
            checkResponsiveView();
            updateBookState();
        });
        window.addEventListener('load', () => {
            checkResponsiveView();
            updateBookState();
        });

        // 5. 외부 링크(해시) 또는 초기화 로직
        window.addEventListener('DOMContentLoaded', () => {
            // 초기 렌더링
            checkResponsiveView();
            updateBookState();

            // 키보드 좌우 화살표 키로 페이지 탐색 기능
            window.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowLeft') {
                    prevPage();
                } else if (e.key === 'ArrowRight') {
                    nextPage();
                }
            });

            // 책자 클릭/터치하여 페이지 넘기기
            const bookElement = document.getElementById('book');
            if (bookElement) {
                bookElement.addEventListener('click', function (e) {
                    if (e.target.closest('button, a, input, select, textarea, .quiz-option-btn, .faq-question, .story-item, .features-list, .timeline, .facilities-list, .major-grid, .dept-fac-list, .career-list, .curriculum-table')) {
                        return;
                    }

                    const rect = bookElement.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const halfWidth = rect.width / 2;

                    if (clickX < halfWidth) {
                        prevPage();
                    } else {
                        nextPage();
                    }
                });
            }

            // 모바일 스와이프 터치 터치 스와이프 구현 (좌/우 슬라이드)
            const viewportEl = document.querySelector('.book-viewport') || document.getElementById('book-container');
            if (viewportEl) {
                let touchStartX = 0;
                let touchStartY = 0;
                viewportEl.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].clientX;
                    touchStartY = e.changedTouches[0].clientY;
                }, { passive: true });

                viewportEl.addEventListener('touchend', (e) => {
                    if (e.target.closest('button, a, input, select, textarea, .quiz-option-btn, .faq-question, input[type=range]')) {
                        return;
                    }
                    const touchEndX = e.changedTouches[0].clientX;
                    const touchEndY = e.changedTouches[0].clientY;
                    const diffX = touchStartX - touchEndX;
                    const diffY = touchStartY - touchEndY;

                    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                        if (diffX > 0) {
                            nextPage();
                        } else {
                            prevPage();
                        }
                    }
                }, { passive: true });
            }

            // 해시 값 확인하여 적절한 전공 페이지로 책 넘겨주기
            const hash = window.location.hash;
            if (hash === '#control') {
                goToSheet(3);
            } else if (hash === '#electronics') {
                goToSheet(4);
            } else if (hash === '#telecom') {
                goToSheet(5);
            } else if (hash === '#mechanic') {
                goToSheet(7);
            }
        });
