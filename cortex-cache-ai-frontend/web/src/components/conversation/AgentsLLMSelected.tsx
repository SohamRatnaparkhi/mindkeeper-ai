import { ChevronRight, Search } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import CustomScrollArea from '../ui/CustomScrollArea';
import { Input } from '../ui/input';

interface Item {
    value: string;
    label: string;
}

interface SelectorProps {
    agents?: Item[];
    llms?: Item[];
    setSelectedAgent: (agent: string) => void;
    setSelectedLLM: (llm: string) => void;
    setIsDialogOpen: (open: boolean) => void;
}

const AgentLLMSelector: React.FC<SelectorProps> = ({
    agents = [],
    llms = [],
    setSelectedAgent,
    setSelectedLLM,
    setIsDialogOpen
}) => {
    const [agentSearchTerm, setAgentSearchTerm] = React.useState("")
    const [llmSearchTerm, setLLMSearchTerm] = React.useState("")
    const [agentCurrentPage, setAgentCurrentPage] = React.useState(1)
    const [llmCurrentPage, setLLMCurrentPage] = React.useState(1)
    const itemsPerPage = 10

    const renderSection = (
        title: string,
        items: Item[],
        onSelect: (value: string) => void,
        searchTerm: string,
        setSearchTerm: (term: string) => void,
        currentPage: number,
        setCurrentPage: (page: number) => void
    ) => {
        const filteredItems = items.filter((item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.value.toLowerCase().includes(searchTerm.toLowerCase())
        )

        const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
        const paginatedItems = filteredItems.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )

        if (items.length === 0) return null

        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </h4>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder={`Search ${title}...`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="pl-10"
                    />
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={20}
                    />
                </div>
                <CustomScrollArea className="h-fit max-h-[calc(50vh-8rem)] rounded-md border">
                    <div className="divide-y">
                        {paginatedItems.map((item) => (
                            <div
                                key={item.value}
                                onClick={() => {
                                    onSelect(item.value)
                                    setIsDialogOpen(false)
                                }}
                                className="px-4 py-3 hover:bg-accent transition-colors duration-200 cursor-pointer group flex items-center justify-between"
                            >
                                <span className="text-sm font-medium group-hover:text-accent-foreground truncate">
                                    {item.label}
                                </span>
                                <ChevronRight
                                    className="text-muted-foreground group-hover:text-accent-foreground group-hover:translate-x-1 transition-all"
                                    size={20}
                                />
                            </div>
                        ))}
                    </div>
                </CustomScrollArea>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-2">
                        <Button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                        >
                            Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                        >
                            Next
                        </Button>
                    </div>
                )}
                {paginatedItems.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                        No {title.toLowerCase()} found
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6 h-full overflow-hidden">
            {renderSection(
                "Agents",
                agents,
                setSelectedAgent,
                agentSearchTerm,
                setAgentSearchTerm,
                agentCurrentPage,
                setAgentCurrentPage
            )}
            {renderSection(
                "Language Models",
                llms,
                setSelectedLLM,
                llmSearchTerm,
                setLLMSearchTerm,
                llmCurrentPage,
                setLLMCurrentPage
            )}
        </div>
    )
};

export default AgentLLMSelector;