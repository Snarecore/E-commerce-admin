interface PageHeaderProps {
    headerTitle: string;
    headerDescription?: string;
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ headerTitle, headerDescription, children }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col">
                <p className="text-[18px] font-bold text-[#212B36]">{headerTitle}</p>
                {headerDescription && <p className="text-[14px] text-[#646b72]">{headerDescription}</p>}
            </div>
            {children && <div>{children}</div>}
        </div>
    );
};

export default PageHeader;
