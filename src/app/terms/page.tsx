import { LegalLayout } from '@/components/landing/LegalLayout';

export default function TermsPage() {
    return (
        <LegalLayout title="Termos de Uso">
            <p>Última atualização: 9 de Março de 2026</p>

            <h2>1. Aceitação dos Termos</h2>
            <p>
                Ao acessar e usar o Inventário Ágil, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve usar o serviço.
            </p>

            <h2>2. Descrição do Serviço</h2>
            <p>
                O Inventário Ágil é uma plataforma SaaS de gestão de inventário e armazéns (WMS) que utiliza inteligência artificial e processamento em tempo real para otimizar operações logísticas.
            </p>

            <h2>3. Cadastro e Segurança</h2>
            <p>
                Para acessar certas funcionalidades, você deve criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorram sob sua conta.
            </p>

            <h2>4. Uso Permitido</h2>
            <p>
                Você concorda em usar o serviço apenas para fins legais e de acordo com as instruções fornecidas. É proibido:
            </p>
            <ul>
                <li>Tentar burlar medidas de segurança.</li>
                <li>Usar o serviço para armazenar ou transmitir dados maliciosos.</li>
                <li>Fazer engenharia reversa da plataforma.</li>
            </ul>

            <h2>5. Propriedade Intelectual</h2>
            <p>
                Todo o conteúdo, código, design e algoritmos do Inventário Ágil são propriedade exclusiva da nossa empresa ou de nossos licenciadores e são protegidos por leis de direitos autorais.
            </p>

            <h2>6. Limitação de Responsabilidade</h2>
            <p>
                O serviço é fornecido {`"como está"`}. Não garantimos que o serviço será ininterrupto ou livre de erros. Em nenhum caso seremos responsáveis por danos indiretos, incidentais ou consequenciais decorrentes do uso do serviço.
            </p>

            <h2>7. Alterações nos Termos</h2>
            <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre alterações significativas através da plataforma ou por e-mail.
            </p>
        </LegalLayout>
    );
}
