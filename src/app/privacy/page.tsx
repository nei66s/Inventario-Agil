import { LegalLayout } from '@/components/landing/LegalLayout';

export default function PrivacyPage() {
    return (
        <LegalLayout title="Política de Privacidade">
            <p>Última atualização: 9 de Março de 2026</p>

            <p>
                No Inventário Ágil, a privacidade e a segurança dos seus dados são nossa prioridade máxima. Esta política descreve como coletamos, usamos e protegemos suas informações.
            </p>

            <h2>1. Informações que Coletamos</h2>
            <p>
                Coletamos informações que você nos fornece diretamente, como nome, e-mail, nome da empresa e dados de inventário necessários para a operação do sistema.
            </p>

            <h2>2. Uso das Informações</h2>
            <p>
                As informações coletadas são utilizadas para:
            </p>
            <ul>
                <li>Fornecer, manter e melhorar nossos serviços.</li>
                <li>Processar transações e enviar notificações operacionais.</li>
                <li>Treinar e aprimorar nossos modelos de IA (usando dados anonimizados quando possível).</li>
                <li>Enviar comunicações de marketing, caso você opte por recebê-las.</li>
            </ul>

            <h2>3. Compartilhamento de Dados</h2>
            <p>
                Não vendemos seus dados para terceiros. Compartilhamos informações apenas com provedores de serviços essenciais (como hospedagem em nuvem e processadores de pagamento) ou conforme exigido por lei.
            </p>

            <h2>4. Segurança</h2>
            <p>
                Implementamos medidas técnicas e organizacionais rigorosas para proteger seus dados contra acesso não autorizado, alteração ou destruição. Isso inclui criptografia de dados em repouso e em trânsito.
            </p>

            <h2>5. Seus Direitos (LGPD)</h2>
            <p>
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de acessar, corrigir, excluir ou portar seus dados pessoais. Você pode exercer esses direitos através das configurações do seu perfil ou entrando em contato com nosso suporte.
            </p>

            <h2>6. Cookies</h2>
            <p>
                Usamos cookies para melhorar sua experiência de navegação e lembrar suas preferências (como o tema escuro). Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
            </p>

            <h2>7. Contato</h2>
            <p>
                Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco em <a href="mailto:privacidade@inventarioagil.com">privacidade@inventarioagil.com</a>.
            </p>
        </LegalLayout>
    );
}
