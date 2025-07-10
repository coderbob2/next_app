import { useFrappeGetCall } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

interface WorkspaceResponse {
    message: {
        charts: { items: any[] };
        shortcuts: { items: any[] };
        cards: { items: any[] };
        onboardings: { items: any[] };
        quick_lists: { items: any[] };
        number_cards: { items: any[] };
        custom_blocks: { items: any[] };
    }
}

const WorkspacePage = () => {
    const { page_name } = useParams();
    const navigate = useNavigate();
    const { data, error } = useFrappeGetCall<WorkspaceResponse>('frappe.desk.desktop.get_desktop_page', { page: JSON.stringify({name: page_name}) });

    if (error) {
        return <div>Error loading page</div>;
    }

    if (!data) {
        return <Spinner />;
    }

    const { shortcuts, cards } = data.message;

    const handleShortcutClick = (shortcut: any) => {
        if (shortcut.type === 'DocType') {
            navigate(`/doctype/${shortcut.link_to}`);
        }
    };

    const handleLinkClick = (link: any) => {
        if (link.link_type === 'DocType') {
            navigate(`/doctype/${link.link_to}`);
        }
    };

    return (
        <div className="workspace-page p-4">
            <h1 className="text-2xl font-bold mb-4">{page_name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortcuts.items.map((shortcut) => (
                    <Button key={shortcut.name} variant="outline" className="w-full" onClick={() => handleShortcutClick(shortcut)}>
                        {shortcut.label}
                    </Button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {cards.items.map((card) => (
                    <Card key={card.name}>
                        <CardHeader>
                            <CardTitle>{card.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul>
                                {card.links.map((link: any) => (
                                    <li key={link.name} onClick={() => handleLinkClick(link)} className="cursor-pointer hover:underline">
                                        {link.label}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default WorkspacePage;
